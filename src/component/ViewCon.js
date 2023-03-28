import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { message, Spin } from "antd";
import { db } from "src/firebase";
import {
  ref as dRef,
  set,
  get,
  onValue,
  off,
  runTransaction,
  update,
  query,
  orderByChild,
  limitToLast,
  remove,
} from "firebase/database";
import { getFormatDate } from "@component/CommonFunc";
import uuid from "react-uuid";
import style from "styles/view.module.css";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";
import { MdOutlineHowToVote, MdHowToVote, MdTimer } from "react-icons/md";
import Countdown from "react-countdown";

import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { BiTargetLock } from "react-icons/bi";
import { useRouter } from "next/router";
import imageCompression from "browser-image-compression";
import {
  getStorage,
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import SubmitForm from "./view/SubmitForm";
import RoomInfo from "./view/RoomInfo";
import RoomChat from "./view/RoomChat";
import RoomVote from "./view/RoomVote";
import WinnerModal from "./view/WinnerModal";

const storage = getStorage();

function ViewCon({ uid }) {
  const rankingBtnRef = useRef();
  const [domWid, setDomWid] = useState();

  useEffect(() => {
    setDomWid(document.body.clientWidth);
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const scrollBox = useRef();
  const formRef = useRef();
  const listRef = useRef([]);
  const voterRef = useRef([]);
  const router = useRouter();
  const queryPath = `${router.query.year}/${router.query.mon}/${router.query.day}/${router.query.uid}/`;

  const userInfo = useSelector((state) => state.user.currentUser);
  const [roomData, setRoomData] = useState();
  const [finishVote, setFinishVote] = useState(false);
  const [voteListData, setVoteListData] = useState();
  const [listLength, setListLength] = useState();

  const [ranking, setRanking] = useState([]);
  const [winnerData, setWinnerData] = useState();

  const [chatList, setChatList] = useState([]);
  const [chatLength, setChatLength] = useState();

  const [newChatState, setNewChatState] = useState(false);
  const [newVoteState, setNewVoteState] = useState(false);

  const [opinionList, setOpinionList] = useState(); //의견리스트

  const [restNumber, setRestNumber] = useState(); //남은 제안횟수

  useEffect(() => {
    let chatRef = query(
      dRef(db, `chat_list/${uid}/list`),
      orderByChild("date"),
      limitToLast(200)
    );
    onValue(chatRef, (data) => {
      let arr = [];
      data.forEach((el, idx) => {
        arr.push(el.val());
      });
      arr = arr.map((el) => {
        el.chat = el.chat.replace(/\|n\|/g, "<br />");
        el.date = getFormatDate(new Date(el.date));
        return el;
      });
      arr.sort((a, b) => {
        return a.date - b.date;
      });

      setChatList(arr);
    });
    return () => {
      off(chatRef);
    };
  }, []);

  useEffect(() => {
    let lastIdx = chatList.length;
    setChatLength((prev) => {
      let key = `${uid}_chat`;
      let chk = JSON.parse(localStorage.getItem("voteChatLocalStorage"));
      chk = chk ? chk[key] : chk;
      if (lastIdx && chk !== lastIdx) {
        if (roomType) {
          setNewChatState(true);
        } else {
          setChatStorage(lastIdx);
        }
      }
      return prev === lastIdx ? lastIdx : prev;
    });
  }, [chatList]);

  const [disVoteCount, setDisVoteCount] = useState();
  useEffect(() => {
    let roomRef = dRef(db, `list/${queryPath}`);
    onValue(roomRef, (data) => {
      if (!data.val().ing) {
        if (
          !data.val().finish_check ||
          !data.val().finish_check.includes(userInfo.uid)
        ) {
          setFinishVote(true);
        }
      }
      setRoomData(data.val());
      userInfo.uid &&
        data.val()[userInfo.uid] &&
        data.val()[userInfo.uid].disvote_count != undefined &&
        setDisVoteCount(data.val()[userInfo.uid].disvote_count);

      let maxSubmit = data.val().max_vote;
      let mySumbit = data.val()[userInfo.uid]
        ? data.val()[userInfo.uid].submit_count
        : 0;
      setRestNumber(maxSubmit - mySumbit);
    });
    let voteRef = dRef(db, `vote_list/${queryPath}`);
    onValue(voteRef, (data) => {
      let arr = [];
      data.forEach((el) => {
        let el_vote = el.val().vote_count || 0;
        let el_dis_vote = el.val().dis_vote_count || 0;
        let elCount = el_vote - el_dis_vote;
        let opinionList = [];
        for (const key in el.val().opinion) {
          opinionList.push({ ...el.val().opinion[key], uid: key });
        }
        arr.push({
          ...el.val(),
          winner_point: elCount,
          uid: el.key,
          opinionList,
        });
      });
      if (userInfo) {
        arr.forEach((list) => {
          let check =
            list.user_uid &&
            list.user_uid.find((user) => {
              return user.uid === userInfo.uid;
            });
          list.already_check = check ? true : false;
          let disCheck =
            list.dis_user_uid &&
            list.dis_user_uid.find((user) => {
              return user.uid === userInfo.uid;
            });
          list.dis_already_check = disCheck ? true : false;
        });
      }
      arr.sort((a, b) => {
        return a.date.timestamp - b.date.timestamp;
      });
      setVoteListData(arr);
      let rankArr = arr.concat();
      rankArr = rankArr
        .sort((a, b) => {
          return b.winner_point - a.winner_point;
        })
        .slice(0, 5);
      setRanking(rankArr);
    });
    return () => {
      off(voteRef);
    };
  }, [userInfo]);

  let timer;
  useEffect(() => {
    if (disVoteCount?.alert && !timer) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = false;
        message.success("반대투표로 인해 제안이 취소되었습니다.");
      }, 100);
    }
  }, [disVoteCount]);

  useEffect(() => {
    let lastIdx = voteListData?.length;
    setListLength((prev) => {
      let key = `${uid}_vote`;
      let chk = JSON.parse(localStorage.getItem("voteChatLocalStorage"));
      chk = chk ? chk[key] : chk;
      if (chk !== lastIdx) {
        if (!roomType) {
          setNewVoteState(true);
        } else {
          setVoteStorage(prev);
        }
      }
      return prev === lastIdx ? lastIdx : prev;
    });
  }, [voteListData]);

  const scrollToBottom = () => {
    scrollBox?.current?.scrollIntoView({ block: "end" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [listLength]);

  //이미지 리사이즈
  const imageResize = async (file, size) => {
    if (file.type === "image/svg+xml") {
      return file;
    }
    const options = {
      maxWidthOrHeight: size,
      fileType: file.type,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const promise = imageCompression.getDataUrlFromFile(compressedFile);
      return promise;
    } catch (error) {
      console.log(error);
    }
  };
  //base64 to file
  const dataURLtoFile = (dataurl, fileName) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const [clipImg, setClipImg] = useState([]);

  //스위치
  const [roomType, setRoomType] = useState(true);
  const onChangeSwitch = (type) => {
    if (type === "vote") {
      setRoomType(true);
      setVoteStorage();
    } else {
      setRoomType(false);
      setChatStorage();
    }
  };

  const setVoteStorage = (num) => {
    let obj = {};
    let getStorage = JSON.parse(localStorage.getItem("voteLocalStorage"));
    setNewVoteState(false);
    let key = `${uid}_vote`;
    obj[key] = num ? num : listLength;
    getStorage = {
      ...getStorage,
      ...obj,
    };
    localStorage.setItem("voteLocalStorage", JSON.stringify(getStorage));
  };

  const setChatStorage = (num) => {
    let obj = {};
    let getStorage = JSON.parse(localStorage.getItem("chatLocalStorage"));
    setNewChatState(false);
    let key = `${uid}_chat`;
    obj[key] = num ? num : chatLength;
    getStorage = {
      ...getStorage,
      ...obj,
    };
    localStorage.setItem("chatLocalStorage", JSON.stringify(getStorage));
  };

  const [submitLoading, setSubmitLoading] = useState(false);

  const onFinish = (values) => {
    const linkRegex = /[\<\>\{\}\s]/g;
    values.title && values.title.replace(linkRegex, "");
    values.link = values.link ? values.link.replace(linkRegex, "") : "";
    values.img = values.img ? values.img.replace(linkRegex, "") : "";
    if (values.title.length > 30) {
      message.error("제목이 너무 깁니다.");
      return;
    }
    if (values.link.length > 200) {
      message.error("링크주소 경로가 너무 깁니다.");
      return;
    }
    if (values.img.length > 200) {
      message.error("이미지주소 경로가 너무 깁니다.");
      return;
    }
    runTransaction(dRef(db, `list/${queryPath}/${userInfo.uid}`), (pre) => {
      if (pre && pre.submit_count && pre.submit_count >= roomData.max_vote) {
        message.error(`최대 제안횟수를 초과했습니다.`);
        return;
      } else {
        setSubmitLoading(true);
        let files = clipImg;
        if (files.length > 0) {
          values.image = [];
          files.forEach((el) => {
            let file = el.file;
            const metadata = { contentType: file.type };
            const storageRef = sRef(storage, `images/${uid}/${el.fileName}`);
            imageResize(file, 1000)
              .then((data) => {
                file = dataURLtoFile(data, file.name);
              })
              .then(() => {
                const uploadTask = uploadBytesResumable(
                  storageRef,
                  file,
                  metadata
                );
                uploadTask.on(
                  "state_changed",
                  (snapshot) => {
                    const progress =
                      (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    switch (snapshot.state) {
                      case "paused":
                        break;
                      case "running":
                        break;
                    }
                  },
                  (error) => {
                    switch (error.code) {
                      case "storage/unauthorized":
                        break;
                      case "storage/canceled":
                        break;
                      // ...
                      case "storage/unknown":
                        break;
                    }
                  },
                  () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(
                      (downloadURL) => {
                        values.image = [...values.image, downloadURL];
                        if (values.image.length === files.length) {
                          onSubmit(values);
                        }
                      }
                    );
                  }
                );
              });
          });
        } else {
          onSubmit(values);
        }

        let res = {
          ...pre,
          disvote_count: {
            count: 0,
            alert: false,
            title: "",
          },
          submit_count: pre && pre.submit_count ? pre.submit_count + 1 : 1,
        };
        return res;
      }
    });
  };

  const onSubmit = (values) => {
    values.info = values.info || "";
    values.upload = "";
    const date = getFormatDate(new Date());
    const uid_ = uuid();
    const val = {
      ...values,
      date,
      user_name: userInfo.displayName,
      vote_user: userInfo.uid,
      //user_uid: [{ uid: userInfo.uid, name: userInfo.displayName }],
      vote_count: 0,
    };
    set(dRef(db, `vote_list/${queryPath}/${uid_}`), {
      ...val,
    });
    closeSubmitPop();
    setSubmitLoading(false);
  };

  //좋아요 투표
  const onVote = async (uid_, user_uid, vote_userId, already) => {
    let voteCount;
    const finishCheck = await get(dRef(db, `list/${queryPath}/ing`)).then(
      (data) => {
        return data.val();
      }
    );
    if (!finishCheck) {
      message.info("종료된 투표 입니다.");
      return;
    }
    let uidArr = [];
    user_uid = user_uid ? user_uid : [];
    user_uid.map((user) => {
      uidArr.push(user.uid);
    });

    if (roomData.cancel === 2) {
      if (uidArr.includes(userInfo.uid)) {
        message.error("이미 투표한 의견입니다.");
        return;
      }
      if (
        roomData.type === 1 &&
        roomData.vote_user &&
        roomData.vote_user[userInfo.uid] &&
        roomData.vote_user[userInfo.uid].vote_count >= 1
      ) {
        message.error("단일투표 입니다.");
        return;
      }
      update(dRef(db, `vote_list/${queryPath}/${uid_}`), {
        user_uid: [
          ...user_uid,
          { uid: userInfo.uid, name: userInfo.displayName },
        ],
      });

      voteCount = await runTransaction(
        dRef(db, `vote_list/${queryPath}/${uid_}/vote_count`),
        (pre) => {
          voteCount = pre ? ++pre : 1;
          return voteCount;
        }
      );
      runTransaction(
        dRef(db, `list/${queryPath}/vote_user/${userInfo.uid}`),
        (pre) => {
          let res = {
            ...pre,
            vote_count: pre && pre.vote_count ? pre.vote_count + 1 : 1,
          };
          return res;
        }
      );
    } else if (already) {
      let newUser = user_uid.filter((el) => el.uid !== userInfo.uid);
      update(dRef(db, `vote_list/${queryPath}/${uid_}`), {
        user_uid: [...newUser],
      });
      voteCount = await runTransaction(
        dRef(db, `vote_list/${queryPath}/${uid_}/vote_count`),
        (pre) => {
          voteCount = pre ? --pre : 0;
          return voteCount;
        }
      );

      runTransaction(
        dRef(db, `list/${queryPath}/vote_user/${userInfo.uid}`),
        (pre) => {
          let res = {
            ...pre,
            vote_count: pre && pre.vote_count ? pre.vote_count - 1 : 0,
          };
          return res;
        }
      );
    } else {
      if (
        roomData.type === 1 &&
        roomData.vote_user &&
        roomData.vote_user[userInfo.uid] &&
        roomData.vote_user[userInfo.uid].vote_count >= 1
      ) {
        message.error("단일투표 입니다.");
        return;
      }

      update(dRef(db, `vote_list/${queryPath}/${uid_}`), {
        user_uid: [
          ...user_uid,
          { uid: userInfo.uid, name: userInfo.displayName },
        ],
      });
      voteCount = await runTransaction(
        dRef(db, `vote_list/${queryPath}/${uid_}/vote_count`),
        (pre) => {
          voteCount = pre ? ++pre : 1;
          return voteCount;
        }
      );
      runTransaction(
        dRef(db, `list/${queryPath}/vote_user/${userInfo.uid}`),
        (pre) => {
          let res = {
            ...pre,
            vote_count: pre && pre.vote_count ? pre.vote_count + 1 : 1,
          };
          return res;
        }
      );
    }
    if (
      roomData.finish_type === 2 &&
      voteCount.snapshot._node.value_ >= roomData.finish_count
    ) {
      console.log("finish");
      const curVote = ranking.filter((el) => el.uid == uid_);
      onVoteFinish("current", curVote[0]);
    }
  };

  const onDisVote = async (uid_, user_uid, vote_userId, already, title) => {
    let disVoteCnt = 0;
    const finishCheck = await get(dRef(db, `list/${queryPath}/ing`)).then(
      (data) => {
        return data.val();
      }
    );
    if (!finishCheck) {
      message.info("종료된 투표 입니다.");
      return;
    }
    let uidArr = [];
    user_uid = user_uid ? user_uid : [];
    user_uid.map((user) => {
      uidArr.push(user.uid);
    });

    if (roomData.cancel === 2) {
      if (uidArr.includes(userInfo.uid)) {
        message.error("이미 투표한 의견입니다.");
        return;
      }
      if (
        roomData.type === 1 &&
        roomData.dis_vote_user &&
        roomData.dis_vote_user[userInfo.uid] &&
        roomData.dis_vote_user[userInfo.uid].vote_count >= 1
      ) {
        message.error("단일투표 입니다.");
        return;
      }
      update(dRef(db, `vote_list/${queryPath}/${uid_}`), {
        dis_user_uid: [
          ...user_uid,
          { uid: userInfo.uid, name: userInfo.displayName },
        ],
      });
      disVoteCnt = await runTransaction(
        dRef(db, `vote_list/${queryPath}/${uid_}/dis_vote_count`),
        (pre) => {
          return pre ? ++pre : 1;
        }
      );

      runTransaction(
        dRef(db, `list/${queryPath}/dis_vote_user/${userInfo.uid}`),
        (pre) => {
          let res = {
            ...pre,
            vote_count: pre && pre.vote_count ? pre.vote_count + 1 : 1,
          };
          return res;
        }
      );
    } else if (already) {
      // if (userInfo.uid === vote_userId) {
      //   message.error("본인제안은 투표 취소할 수 없습니다.");
      //   return;
      // }
      let newUser = user_uid.filter((el) => el.uid !== userInfo.uid);
      update(dRef(db, `vote_list/${queryPath}/${uid_}`), {
        dis_user_uid: [...newUser],
      });
      runTransaction(
        dRef(db, `vote_list/${queryPath}/${uid_}/dis_vote_count`),
        (pre) => {
          return pre ? --pre : 0;
        }
      );

      disVoteCnt = await runTransaction(
        dRef(db, `list/${queryPath}/dis_vote_user/${userInfo.uid}`),
        (pre) => {
          let res = {
            ...pre,
            vote_count: pre && pre.vote_count ? pre.vote_count - 1 : 0,
          };
          return res;
        }
      );
    } else {
      if (
        roomData.type === 1 &&
        roomData.dis_vote_user &&
        roomData.dis_vote_user[userInfo.uid] &&
        roomData.dis_vote_user[userInfo.uid].vote_count >= 1
      ) {
        message.error("단일투표 입니다.");
        return;
      }
      update(dRef(db, `vote_list/${queryPath}/${uid_}`), {
        dis_user_uid: [
          ...user_uid,
          { uid: userInfo.uid, name: userInfo.displayName },
        ],
      });
      disVoteCnt = await runTransaction(
        dRef(db, `vote_list/${queryPath}/${uid_}/dis_vote_count`),
        (pre) => {
          disVoteCnt = pre ? ++pre : 1;
          return disVoteCnt;
        }
      );
      runTransaction(
        dRef(db, `list/${queryPath}/dis_vote_user/${userInfo.uid}`),
        (pre) => {
          let res = {
            ...pre,
            vote_count: pre && pre.vote_count ? pre.vote_count + 1 : 1,
          };
          return res;
        }
      );
    }
    console.log(disVoteCnt, roomData.finish_count);
    if (
      roomData.finish_type === 2 &&
      disVoteCnt.snapshot._node.value_ >= roomData.finish_count
    ) {
      runTransaction(
        dRef(db, `list/${queryPath}/${vote_userId}/disvote_count`),
        (pre) => {
          ++pre.count;
          pre.alert = true;
          return pre;
        }
      );
      setTimeout(() => {
        update(dRef(db, `list/${queryPath}/${vote_userId}/disvote_count`), {
          alert: false,
        });
      }, 100);
      remove(dRef(db, `vote_list/${queryPath}/${uid_}`));
    }
  };

  const onVoteRemove = (vuid) => {
    remove(dRef(db, `vote_list/${queryPath}/${vuid}`));
    runTransaction(
      dRef(db, `list/${queryPath}/${userInfo.uid}/submit_count`),
      (pre) => {
        return pre > 0 ? --pre : 0;
      }
    );
    message.success(`제안이 취소되었습니다.`);
  };

  const submitBox = useRef();
  const [submitPop, setsubmitPop] = useState(false);
  const onSubmitPop = () => {
    setsubmitPop(true);
    submitBox.current.style.transform = "translate(-50%,0)";
    submitBox.current.style.display = "block";
  };
  const closeSubmitPop = () => {
    setsubmitPop(false);
    submitBox.current.style.transform = "translate(-50%,100%)";
    submitBox.current.style.display = "none";
    formRef.current.setFieldsValue({
      title: "",
      link: "",
    });
    setClipImg("");
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  const clipboard = (e) => {
    const date = new Date().getTime();
    let fileObj = {};
    if (e.type === "paste" && !e.clipboardData.files[0]) {
      message.error("이미지가 아닙니다");
      return;
    }

    fileObj.file =
      e.type === "paste" ? e.clipboardData.files[0] : e.target.files[0];
    const fileType = fileObj.file.type;
    if (
      fileType !== "image/gif" &&
      fileType !== "image/png" &&
      fileType !== "image/jpeg"
    ) {
      message.error("지원하지않는 형식 입니다.");
      return;
    }
    fileObj.fileName =
      e.type === "paste"
        ? `${date}_copyImage.png`
        : `${date}_${fileObj.file.name}`;
    imageResize(fileObj.file, 60).then((res) => {
      fileObj.thumbnail = res;
      setClipImg([...clipImg, fileObj]);
    });
  };
  const removeClipImg = (idx) => {
    let arr = clipImg.concat();
    arr.splice(idx, 1);
    setClipImg(arr);
  };

  const onOutView = () => {
    router.push("/mypage");
  };

  const onVoteFinish = async (type, winData) => {
    let winner;
    if (type == "current") {
      winner = winData;
    } else if (ranking.length >= 1) {
      let overlap = [ranking[0]];
      ranking.forEach((el, idx) => {
        if (idx > 0 && overlap[0].winner_point == el.winner_point) {
          overlap.push(el);
        }
      });
      const random = Math.floor(Math.random() * ranking.length);
      winner = overlap[random];
    }
    update(dRef(db, `list/${queryPath}`), { winner });
    setFinishVote(true);
    runTransaction(dRef(db, `list/${queryPath}/ing`), (pre) => {
      return false;
    });
    message.success("투표가 종료되었습니다.");
  };

  const onVeiwVoteResult = () => {
    setFinishVote(true);
  };

  const finishPopClose = () => {
    setFinishVote(false);
    runTransaction(dRef(db, `list/${queryPath}/finish_check`), (pre) => {
      if (pre && pre.includes(userInfo.uid)) return;
      let arr = pre ? [...pre, userInfo.uid] : [userInfo.uid];
      return arr;
    });
  };

  const onMoveList = (uid) => {
    listRef.current.map((el) => {
      if (el.dataset.uid === uid) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ani_shake");
        setTimeout(() => {
          el.classList.remove("ani_shake");
        }, 500);
      }
    });
  };

  const [rankView, setrankView] = useState(false);
  const toggleRanking = () => {
    setrankView(!rankView);
  };

  const viewVoterList = (idx) => {
    let ref = voterRef.current[idx];
    ref.style.display = ref.style.display === "none" ? "flex" : "none";
  };

  const onTimeOver = () => {
    if (roomData.winner) return;
    onVoteFinish();
  };

  //의견남기기
  const addOpinion = async (uid, value) => {
    if (value === "") {
      return;
    }
    const alreadyCheck = await get(
      dRef(db, `vote_list/${queryPath}/${uid}/opinion/`)
    ).then((data) => {
      if (data.val() && data.val()[userInfo.uid]) {
        return data.val()[userInfo.uid];
      } else {
        return false;
      }
    });
    if (alreadyCheck) {
      message.info("제안마다 하나의 의견만 남길 수 있습니다.");
      return false;
    } else {
      set(dRef(db, `vote_list/${queryPath}/${uid}/opinion/${userInfo.uid}`), {
        value: value,
        name: userInfo.displayName,
        date: new Date().getTime(),
      });
      message.success("의견이 추가 되었습니다.");
      return true;
    }
  };
  const onRemoveOp = (li, uid) => {
    const agree = confirm("삭제하시겠습니까?");
    if (agree) {
      remove(dRef(db, `vote_list/${queryPath}/${li}/opinion/${uid}`));
    }
  };

  return (
    <>
      <div
        className={style.view_con_box}
        style={{ "--domWidPx": `${domWid}px` }}
      >
        {roomData?.winner && finishVote && (
          <WinnerModal
            winner={roomData.winner}
            finishPopClose={finishPopClose}
          />
        )}
        <div className={style.ranking_box}>
          {roomData && (
            <RoomInfo roomData={roomData} roomUid={uid} onOutView={onOutView} />
          )}
          {voteListData && voteListData.length > 0 && rankView && (
            <ul className={style.ranking}>
              {ranking.map((el, idx) => (
                <li key={idx} onClick={() => onMoveList(el.uid)}>
                  <span className={style.rank}>{idx + 1}</span>
                  <div className={style.rank_con}>
                    <div className={style.desc}>
                      <span className={style.vote_tit}>{el.title}</span>
                    </div>
                    <span style={{ marginLeft: "3px" }}>
                      ({el.winner_point}점)
                    </span>
                  </div>
                  <div className={style.ic_target}>
                    <BiTargetLock
                      style={{ marginRight: "4px", fontSize: "13px" }}
                    />
                    이동
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            ref={rankingBtnRef}
            type="button"
            className={style.btn_fold}
            onClick={toggleRanking}
          >
            {rankView ? (
              <>
                <IoIosArrowUp />
                랭킹숨기기
              </>
            ) : (
              <>
                <IoIosArrowDown />
                랭킹보기
              </>
            )}
          </button>
          {/* 투표,채팅 변경 시작 */}
          <div className={style.btn_switch}>
            <button
              type="button"
              onClick={() => {
                onChangeSwitch("vote");
              }}
              className={style.btn_switch_vote}
              style={roomType ? { opacity: "1" } : { opacity: "0.6" }}
            >
              {roomType ? (
                <MdHowToVote style={{ fontSize: "18px" }} />
              ) : (
                <MdOutlineHowToVote style={{ fontSize: "18px" }} />
              )}
            </button>
            {newVoteState && (
              <span className={style.btn_switch_ic_new_vote}>n</span>
            )}
            {newChatState && (
              <span className={style.btn_switch_ic_new_chat}>n</span>
            )}
            <button
              type="button"
              onClick={() => {
                onChangeSwitch("chat");
              }}
              className={style.btn_switch_chat}
              style={roomType ? { opacity: "0.6" } : { opacity: "1" }}
            >
              {roomType ? <BsChatDots /> : <BsChatDotsFill />}
            </button>
          </div>
          {/* 투표,채팅 변경 끝 */}
          {roomData?.timer_type == 2 && !roomData.winner && (
            <div className={style.count_down}>
              <MdTimer style={{ marginRight: "5px" }} />
              {
                <Countdown
                  date={new Date(roomData?.endTime)}
                  onComplete={onTimeOver}
                />
              }
            </div>
          )}
        </div>
        {roomType && (
          <RoomVote
            userInfo={userInfo}
            roomData={roomData}
            scrollBox={scrollBox}
            voteListData={voteListData}
            listRef={listRef}
            voterRef={voterRef}
            onVoteRemove={onVoteRemove}
            viewVoterList={viewVoterList}
            onVote={onVote}
            onDisVote={onDisVote}
            addOpinion={addOpinion}
            onRemoveOp={onRemoveOp}
          />
        )}

        {roomType ? (
          <>
            <div className={style.empty}></div>
            {roomData && roomData.ing ? (
              <div className={style.btn_open_box}>
                <button
                  type="button"
                  className={style.btn_open}
                  onClick={onSubmitPop}
                >
                  의견제안 ({restNumber})
                </button>
                {roomData &&
                  userInfo &&
                  roomData.finish_type === 1 &&
                  roomData.host === userInfo.uid && (
                    <button
                      type="button"
                      className={style.btn_finish}
                      onClick={onVoteFinish}
                    >
                      투표종료
                    </button>
                  )}
              </div>
            ) : (
              <div className={style.btn_open_box}>
                <div className={style.finish_txt}>투표가 종료되었습니다</div>
                <button
                  style={{ width: "100px" }}
                  type="button"
                  onClick={onVeiwVoteResult}
                >
                  결과보기
                </button>
              </div>
            )}
          </>
        ) : (
          <RoomChat
            userInfo={userInfo}
            uid={uid}
            chatList={chatList}
            chatLength={chatLength}
            roomType={roomType}
          />
        )}

        {submitPop && (
          <div className={style.bg_box} onClick={closeSubmitPop}></div>
        )}
        <div ref={submitBox} className={style.submit_box}>
          {submitLoading && (
            <div className={style.loading_box}>
              <Spin tip="Loading..."></Spin>
            </div>
          )}
          <SubmitForm
            onFinish={onFinish}
            roomData={roomData}
            formRef={formRef}
            imageResize={imageResize}
            removeClipImg={removeClipImg}
            clipImg={clipImg}
            clipboard={clipboard}
          />
        </div>
      </div>
    </>
  );
}

export default ViewCon;
