import React, { useRef, useEffect, useState } from "react";
import style from "../../../styles/view.module.css";
import { Button, Form, Input } from "antd";
import { db } from "../../../src/firebase";
import { ref as dRef, set, runTransaction } from "firebase/database";
import uuid from "react-uuid";
import ChatList from "./ChatList";

function RoomChat({ userInfo, uid, chatList, chatLength, roomType }) {
  const scrollBox = useRef();
  const submitRef = useRef();
  const chatFormRef = useRef();

  const onFinish = (values) => {
    if (!values.chat) return;
    values.chat = values.chat.replace(/\n/g, "|n|");
    let uid_ = uuid();
    runTransaction(dRef(db, `chat_list/${uid}/count`), (pre) => {
      return pre ? ++pre : 1;
    })
      .then((idx) => {
        let val = {
          ...values,
          name: userInfo.displayName,
          user: userInfo.uid,
          date: Date.now(),
          idx: idx.snapshot._node.value_,
        };
        set(dRef(db, `chat_list/${uid}/list/${uid_}`), {
          ...val,
        });
      })
      .then(() => {
        setFieldsValue();
      });
  };

  const onEnter = (e) => {
    if (e.ctrlKey && e.code === "Enter") {
      submitRef.current.click();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollBox.current.scrollTo({ top: `${scrollBox.current.scrollHeight}` });
    }, 50);
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatLength]);

  const setFieldsValue = () => {
    chatFormRef.current.setFieldsValue({
      chat: "",
    });
  };

  return (
    <div ref={scrollBox} className={style.room_chat_box}>
      <ChatList uid={uid} chatList={chatList} userInfo={userInfo} />
      <Form ref={chatFormRef} onFinish={onFinish}>
        <Form.Item name="chat" className={style.room_chat_input}>
          <Input.TextArea
            placeholder="ctr+enter로 전송가능"
            onKeyPress={onEnter}
            className={style.room_chat_textArea}
          />
        </Form.Item>
        <Button
          ref={submitRef}
          type="primary"
          htmlType="submit"
          style={{ width: "80px", height: "auto" }}
        >
          전송
        </Button>
      </Form>
    </div>
  );
}

export default RoomChat;
