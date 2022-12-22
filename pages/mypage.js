import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "src/firebase";
import { signOut } from "firebase/auth";
import { clearUser, nickChange } from "@redux/actions/user_action";
import { useRouter } from "next/router";
import { db } from "src/firebase";
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
} from "firebase/database";
import { Modal, Input, message, Menu, Dropdown } from "antd";
import ListUl from "../src/component/ListUl";
import { IoSettingsOutline } from "react-icons/io5";
import {
  getStorage,
  ref as sRef,
  deleteObject,
  listAll,
} from "firebase/storage";
import { getFormatDate } from "@component/CommonFunc";

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
        let vote_check = false;
        const list = el.val();
        for (const key in list) {
          if (list[key].vote_user) {
            for (let key2 in list[key].vote_user) {
              if (userInfo) {
                vote_check = userInfo.uid === key2 ? true : false;
              }
            }
          }
          if ((userInfo && list[key].host === userInfo.uid) || vote_check) {
            listArr.push({ ...list[key], uid: key });
          }
        }
      });
      // tag를 객체에서 배열로 변환
      listArr.map((el) => {
        let tagArr = Object.keys(el.tag);
        el.tag = tagArr;
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
      (data) => data.val() && data.val().indexOf(`${uid}`)
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

  return (
    userInfo && (
      <div className="mypage_box">
        <div className="profile_box">
          <div className="profile">
            <div>
              <span className="name">{userInfo.displayName}</span>님 환영합니다.
            </div>
            <div className="right_menu">
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
            </div>
          </div>
        </div>
        <Modal
          title="닉네임 변경"
          visible={nickModal}
          onOk={onNickChange}
          onCancel={nickModalClose}
        >
          <Input
            onChange={onInputNick}
            placeholder="특수문자제외 10자이내로 가능합니다."
            size="large"
          />
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
    )
  );
}

export default Mypage;
