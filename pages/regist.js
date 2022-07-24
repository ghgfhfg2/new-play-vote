import React, {useState} from "react";
import { useSelector } from "react-redux";
import { Form, Input, Button, Checkbox, Radio } from "antd";
import { db } from "src/firebase";
import { ref, set, runTransaction, update } from "firebase/database";
import uuid from "react-uuid";
import { getFormatDate } from "@component/CommonFunc";
import {useRouter} from 'next/router'

function Regist() {
  const router = useRouter();
  const userInfo = useSelector((state) => state.user.currentUser);

  const onFinish = (values) => {

    const date = getFormatDate(new Date());
    const uid = uuid();
    if(values.tag){
      const tagArr = values.tag.split(',');
      let tagObj = {}
      tagArr.map(el=>{
        tagObj[el] = 1;
      })
      
      runTransaction(ref(db,`tag/${date.full}`), pre => {
        if(pre){
          for(let key in pre){
            tagArr.map(el => {
              pre[key] = key === el ? pre[key]+1 : pre[key];
            })
          }
          tagArr.map(el => {
            if(!pre[el]){
              pre[el] = 1
            }
          })
          return pre
        }else{
          return tagObj
        }
      })
    }
    runTransaction(ref(db,`user/${userInfo.uid}`), pre => {
      if(pre.room){
        pre.room = [...pre.room, uid]
      }else{
        pre.room = [uid]
      }
      return pre;
    })
    .then(()=>{
      set(ref(db,`list/${uid}`),{
        ...values,
        tag:tagObj ? tagObj : '',
        date,
        ing: true,
        host: userInfo.uid,
        vote_user:''
      });
    })
    .then(()=>{
      router.push(`/view/${uid}`);
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };


  return (
    <>
      <div className="regist_box">
        <Form
          name="basic"
          initialValues={{ 
            type: 1 ,
            sender: 1,
            voter: 1,
            cancel: 2,
            room_open: 1,
            password: '',
            max_vote: 1,
            add:''
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="write_form"
        >
          <Form.Item
            label="제목"
            name="title"
            rules={[{ required: true, message: "제목은 필수입니다." }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            label="태그(콤마(,)로 구분 / 최대10개)"
            name="tag"
          >
            <Input maxLength={100} placeholder="예) 태그1,태그2,태그3" />
          </Form.Item>
          <Form.Item
            label="추가로 입력 가능한 항목"
            name="add"
          >
            <Checkbox.Group>
              <Checkbox value="link">외부링크</Checkbox>
              <Checkbox value="img">이미지</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            label="투표방식"
            name="type"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>단일투표</Radio.Button>
              <Radio.Button value={2}>중복투표</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="투표취소"
            name="cancel"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>가능</Radio.Button>
              <Radio.Button value={2}>불가능</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="최대 제안 횟수"
            name="max_vote"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>1회</Radio.Button>
              <Radio.Button value={2}>2회</Radio.Button>
              <Radio.Button value={3}>3회</Radio.Button>
              <Radio.Button value={4}>4회</Radio.Button>
              <Radio.Button value={5}>5회</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="제안자공개"
            name="sender"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>공개</Radio.Button>
              <Radio.Button value={2}>비공개</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="투표자공개"
            name="voter"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>공개</Radio.Button>
              <Radio.Button value={2}>비공개</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="방 공개(목록에서 표시여부)"
            name="room_open"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>공개방</Radio.Button>
              <Radio.Button value={2}>비공개방</Radio.Button>
            </Radio.Group>
          </Form.Item> 
          <Form.Item
            label="비밀번호"
            name="password"
          >
            <Input placeholder="암호가 없으면 누구나 입장 가능합니다." maxLength={15} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "center",padding:"1rem" }}>
            <Button size="large" type="primary" htmlType="submit" style={{ width: "100%" }}>
              방 생성하기
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default Regist;
