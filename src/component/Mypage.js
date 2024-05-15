import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { setUser, clearUser, nickChange } from "../redux/actions/user_action";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { useRouter } from "next/router";
import { db } from "../firebase";
import {
  ref,
  onValue,
  remove,
  get,
  off,
  update,
  orderByValue,
  orderByChild,
  query,
  equalTo,
  orderByKey,
  startAt,
  endAt,
  set,
  runTransaction,
} from "firebase/database";
import { Modal, Input, message, Menu, Dropdown, Form, Button } from "antd";
import ListUl from "./ListUl";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineRule, MdLogout } from "react-icons/md";
import {
  getStorage,
  ref as sRef,
  deleteObject,
  listAll,
} from "firebase/storage";
import { getFormatDate } from "./CommonFunc";
import RuleList from "./RuleList";

function Mypage() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const storage = getStorage();
  const curDate = getFormatDate(new Date());

  const [listData, setListData] = useState();
  useEffect(() => {
    const listRef = query(
      ref(db, `list/${curDate.year}/${curDate.month}`),
      orderByKey(),
      startAt("0"),
      endAt("31")
    );

    onValue(listRef, (data) => {
      let listArr = [];
      data.forEach((el) => {
        const list = el.val();
        if (!userInfo) return;
        for (const key in list) {
          let vote_check = false;
          if (list[key].vote_user) {
            for (let key2 in list[key].vote_user) {
              if (userInfo.uid === key2) {
                vote_check = true;
              }
            }
          }
          if (
            list[key].host === userInfo.uid ||
            vote_check ||
            list[key][userInfo.uid]
          ) {
            listArr.push({ ...list[key], uid: key });
          }
        }
      });
      // tag를 객체에서 배열로 변환
      // listArr.map((el) => {
      //   let tagArr = Object.keys(el.tag);
      //   el.tag = tagArr;
      // });

      listArr = listArr.sort((a, b) => {
        return b.date.timestamp - a.date.timestamp;
      });
      setListData(listArr);
    });

    return () => {
      off(listRef);
    };
  }, [userInfo]);

  const onDel = async (uid, date) => {
    const listRef = sRef(storage, `images/${uid}`);
    listAll(listRef).then((res) => {
      res.items.forEach((itemRef) => {
        deleteObject(itemRef)
          .then(() => {
            console.log("File deleted");
            // File deleted successfully
          })
          .catch((error) => {
            console.error(error);
            // Uh-oh, an error occurred!
          });
      });
    });
    let roomId = await get(ref(db, `user/${userInfo.uid}/room`)).then(
      (data) => {
        let id;
        if (!data.val()) return;
        for (const key in data.val()) {
          if (data.val()[key] == uid) {
            id = key;
          }
        }
        return id;
      }
    );
    roomId != undefined &&
      remove(ref(db, `user/${userInfo.uid}/room/${roomId}`));
    get(
      ref(db, `vote_list/${date.year}/${date.month}/${date.day}/${uid}`)
    ).then((data) => {
      if (data.val()) {
        remove(
          ref(db, `vote_list/${date.year}/${date.month}/${date.day}/${uid}`)
        );
      }
    });
    remove(ref(db, `list/${date.year}/${date.month}/${date.day}/${uid}`));
    remove(ref(db, `chat_list/${date.year}/${date.month}/${date.day}/${uid}`));
    remove(ref(db, `list_index/${uid}`));
    message.success("삭제되었습니다.");
  };

  //로그아웃
  const googleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push("/");
        dispatch(clearUser());
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [nickModal, setNickModal] = useState(false);
  const onNickModal = () => {
    setNickModal(true);
  };
  const nickModalClose = () => {
    setNickModal(false);
  };
  const [nickInput, setNickInput] = useState();
  const onInputNick = (e) => {
    setNickInput(e.target.value);
  };
  const onNickChange = () => {
    const listRef = ref(db, `user/${userInfo.uid}`);
    update(listRef, { nick: nickInput });
    setNickModal(false);
    dispatch(nickChange(nickInput));
    message.success("닉네임을 변경했습니다.");
  };

  const [ruleModal, setRuleModal] = useState(false);
  const onRuleModal = () => {
    setRuleModal(true);
  };

  const ruleModalClose = () => {
    setRuleModal(false);
  };

  const [isFinishCount, setIsFinishCount] = useState(false);
  const handleFinishType = (e) => {
    if (e.target.value == 2) {
      setIsFinishCount(true);
    } else {
      setIsFinishCount(false);
    }
  };

  const [isFinishTime, setIsFinishTime] = useState(false);
  const handleTimerType = (e) => {
    if (e.target.value == 2) {
      setIsFinishTime(true);
    } else {
      setIsFinishTime(false);
    }
  };

  const onFinish = (values) => {
    set(ref(db, `user/${userInfo.uid}/rule/`), {
      ...values,
    });
    const newUser = userInfo;
    newUser.rule = values;
    dispatch(setUser(newUser));
    message.success("저장되었습니다.");
    setRuleModal(false);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {userInfo && (
        <div className="mypage_box">
          <div className="profile_box">
            <div className="profile">
              <div>
                <span className="name">{userInfo.displayName}</span>님
                환영합니다.
              </div>
              {/* <div className="right_menu">
              <Dropdown
                placement="bottomCenter"
                arrow
                overlay={
                  <Menu>
                    <Menu.Item key="0">
                      <button
                        type="button"
                        className="mypage_button"
                        onClick={onNickModal}
                      >
                        닉네임변경
                      </button>
                    </Menu.Item>
                    <Menu.Item key="1">
                      <button
                        type="button"
                        className="mypage_button"
                        onClick={googleSignOut}
                      >
                        logout
                      </button>
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <IoSettingsOutline />
              </Dropdown>
            </div> */}
            </div>
            <ul className="mypage_menu">
              <li>
                <button
                  type="button"
                  className="mypage_menu"
                  onClick={onNickModal}
                >
                  <AiOutlineUserSwitch />
                  닉네임변경
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="mypage_menu"
                  onClick={onRuleModal}
                >
                  <MdOutlineRule />
                  나만의 방규칙
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="mypage_menu"
                  onClick={googleSignOut}
                >
                  <MdLogout />
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
          <Modal
            title="닉네임 변경"
            visible={nickModal}
            footer={null}
            onCancel={nickModalClose}
          >
            <Input
              onChange={onInputNick}
              placeholder="특수문자제외 10자이내로 가능합니다."
              size="large"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
                gap: "5px",
              }}
            >
              <Button onClick={nickModalClose}>취소</Button>
              <Button onClick={onNickChange} type="primary">
                저장
              </Button>
            </div>
          </Modal>

          <Modal
            title="나만의 방 규칙"
            visible={ruleModal}
            className="rule_modal"
            footer={null}
            onCancel={ruleModalClose}
          >
            <div className="regist_box mypage">
              <Form
                name="basic"
                initialValues={
                  userInfo?.rule
                    ? userInfo.rule
                    : {
                        type: 2,
                        sender: 2,
                        voter: 2,
                        cancel: 1,
                        finish_type: 1,
                        timer_type: 1,
                        finish_count: 2,
                        room_open: 2,
                        delete: 1,
                        password: "",
                        max_vote: 5,
                        add: ["link", "img"],
                      }
                }
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className="write_form"
              >
                <RuleList
                  isFinishCount={isFinishCount}
                  handleFinishType={handleFinishType}
                  isFinishTime={isFinishTime}
                  handleTimerType={handleTimerType}
                />
                <div className="modal-footer">
                  <Button onClick={ruleModalClose}>취소</Button>
                  <Button htmlType="submit" type="primary">
                    저장
                  </Button>
                </div>
              </Form>
            </div>
          </Modal>
          <dl className="my_list">
            <dt className="tit">참여목록</dt>
            <dd>
              {listData && (
                <ListUl
                  router={router}
                  userUid={userInfo.uid}
                  listData={listData}
                  onDel={onDel}
                />
              )}
            </dd>
          </dl>
        </div>
      )}
    </>
  );
}

export default Mypage;
