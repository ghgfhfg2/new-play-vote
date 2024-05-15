import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Checkbox,
  Radio,
  message,
} from "antd";
import { db } from "../src/firebase";
import { ref, set, runTransaction, update, get } from "firebase/database";
import uuid from "react-uuid";
import { getFormatDate } from "../src/component/CommonFunc";
import { useRouter } from "next/router";
import moment from "moment";
import RuleList from "../src/component/RuleList";
import { first, last } from "../src/component/nameDb";

function Regist() {
  const router = useRouter();
  const userInfo = useSelector((state) => state.user.currentUser);

  const topBox = useRef();
  const regisForm = useRef();

  let reFinish = 0;

  const onFinish = async (values) => {
    if (reFinish > 2) {
      message.error("더 이상 방을 생성할 수 없습니다.");
      return;
    }
    const firstRandom = Math.floor(Math.random() * first.length);
    const lastRandom = Math.floor(Math.random() * last.length);
    const firstName = first[firstRandom];
    const lastName = last[lastRandom];

    const ranNum = Math.floor(Math.random() * 1000);
    const uid = `${firstName}${lastName}${ranNum}`;

    const listRef = ref(db, `list_index/${uid}`);
    const dCheck = await get(listRef).then((data) => {
      return data.val();
    });

    if (dCheck) {
      reFinish++;
      onFinish(values);
      return;
    }

    const date = getFormatDate(new Date());
    if (values.timer_type == 2) {
      if (!values.timer_time) {
        message.error("투표종료 제한시간을 입력해주세요.");
        return;
      }
      values.endTime = moment()
        .add(values.timer_time, "minute")
        .format("YYYY MM DD HH:mm:ss");
    }
    let tagObj = {};
    if (values.tag) {
      const tagArr = values.tag.split(",");
      tagObj = {};
      tagArr.map((el) => {
        tagObj[el] = 1;
      });

      runTransaction(
        ref(db, `tag/${date.year}/${date.month}/${date.day}`),
        (pre) => {
          if (pre) {
            for (let key in pre) {
              tagArr.map((el) => {
                pre[key] = key === el ? pre[key] + 1 : pre[key];
              });
            }
            tagArr.map((el) => {
              if (!pre[el]) {
                pre[el] = 1;
              }
            });
            return pre;
          } else {
            return tagObj;
          }
        }
      );
    }
    runTransaction(ref(db, `user/${userInfo.uid}/room`), (pre) => {
      if (pre) {
        pre = [...pre, uid];
      } else {
        pre = [uid];
      }
      pre = pre.filter((el) => el);
      return pre;
    })
      .then(() => {
        set(ref(db, `list/${date.year}/${date.month}/${date.day}/${uid}`), {
          ...values,
          tag: tagObj ? tagObj : "",
          date,
          ing: true,
          host: userInfo.uid,
          vote_user: "",
        });
        set(ref(db, `list_index/${uid}`), {
          path: `${date.year}/${date.month}/${date.day}`,
        });
      })
      .then(() => {
        router.push(
          `/view/id?year=${date.year}/&mon=${date.month}/&day=${date.day}/&uid=${uid}`
        );
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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

  window.addEventListener("scroll", function (e) {
    if (topBox.current) {
      const fixTopY = topBox.current.getBoundingClientRect().top;
      if (this.scrollY > fixTopY) {
        topBox.current.classList.add("on");
        topBox.current.querySelector(
          ".fix_box"
        ).style.width = `${topBox.current.clientWidth}px`;
        if (document.querySelector(".ad_empty")) {
          topBox.current.querySelector(".fix_box").style.top =
            document.querySelector(".ad_empty").clientHeight + "px";
        }
      } else {
        topBox.current.classList.remove("on");
        topBox.current.querySelector(".fix_box").style.width = ``;
        topBox.current.querySelector(".fix_box").style.top = 0;
      }
    }
  });

  const onLoadRule = () => {
    if (userInfo.rule) {
      regisForm.current.setFieldsValue({
        ...userInfo.rule,
      });
      message.success("저장된 방규칙을 불러왔습니다.");
    } else {
      message.info("저장된 방규칙이 없습니다.");
    }
  };

  return (
    <>
      <div className="regist_box">
        <Form
          ref={regisForm}
          name="basic"
          initialValues={
            userInfo?.rule
              ? userInfo?.rule
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
          <div className="fix_wrap" ref={topBox}>
            <div className="fix_box">
              <Form.Item
                label="제목"
                name="title"
                rules={[{ required: true, message: "제목은 필수입니다." }]}
              >
                <Input type="text" maxLength={30} />
              </Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "0 1rem 1rem 1rem",
                }}
              >
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  style={{ width: "100%", height: "55px", borderRadius: "6px" }}
                >
                  방 생성하기
                </Button>
              </div>
            </div>
            <div className="empty"></div>
          </div>

          <div style={{ padding: "1rem", display: "flex" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                marginRight: "10px",
              }}
            >
              방 규칙
            </h2>
            <Button onClick={onLoadRule}>저장된 방규칙 불러오기</Button>
          </div>

          {/* <Form.Item label="태그(콤마(,)로 구분 / 최대10개)" name="tag">
            <Input
              type="text"
              maxLength={100}
              placeholder="예) 태그1,태그2,태그3"
            />
          </Form.Item> */}
          <div style={{ paddingBottom: "1rem" }}>
            <RuleList
              isFinishCount={isFinishCount}
              handleFinishType={handleFinishType}
              isFinishTime={isFinishTime}
              handleTimerType={handleTimerType}
            />
          </div>
        </Form>
      </div>
    </>
  );
}

export default Regist;
