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

export default function RuleList({
  isFinishCount,
  handleFinishType,
  isFinishTime,
  handleTimerType,
}) {
  return (
    <>
      <Form.Item label="추가로 입력 가능한 항목" name="add">
        <Checkbox.Group>
          <Checkbox value="link">외부링크</Checkbox>
          <Checkbox value="img">이미지</Checkbox>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item label="투표방식" name="type">
        <Radio.Group size="large">
          <Radio.Button value={1}>단일투표</Radio.Button>
          <Radio.Button value={2}>중복투표</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="투표취소" name="cancel">
        <Radio.Group size="large">
          <Radio.Button value={1}>가능</Radio.Button>
          <Radio.Button value={2}>불가능</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="최대 제안 횟수" name="max_vote">
        <Radio.Group size="large">
          <Radio.Button value={1}>1회</Radio.Button>
          <Radio.Button value={2}>2회</Radio.Button>
          <Radio.Button value={3}>3회</Radio.Button>
          <Radio.Button value={4}>4회</Radio.Button>
          <Radio.Button value={5}>5회</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="투표종료 기준" name="finish_type">
        <Radio.Group size="large" onChange={handleFinishType}>
          <Radio.Button value={1}>방장이 종료시</Radio.Button>
          <Radio.Button value={2}>지정한 투표수에 도달시</Radio.Button>
        </Radio.Group>
      </Form.Item>
      {isFinishCount && (
        <Form.Item label="투표수 지정" name="finish_count">
          <InputNumber min={2} />
        </Form.Item>
      )}
      <Form.Item label="투표종료 시간제한" name="timer_type">
        <Radio.Group size="large" onChange={handleTimerType}>
          <Radio.Button value={1}>무제한</Radio.Button>
          <Radio.Button value={2}>시간지정</Radio.Button>
        </Radio.Group>
      </Form.Item>
      {isFinishTime && (
        <>
          <Form.Item label="제한시간(분)" name="timer_time">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", marginBottom: "5px" }}>
                ※ 타임오버시 랭킹1위 제안으로 선정, 1위가 중복일때는 랜덤선택
              </span>
              <InputNumber min={1} />
            </div>
          </Form.Item>
        </>
      )}
      <Form.Item label="제안자공개" name="sender">
        <Radio.Group size="large">
          <Radio.Button value={1}>공개</Radio.Button>
          <Radio.Button value={2}>비공개</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="투표자공개" name="voter">
        <Radio.Group size="large">
          <Radio.Button value={1}>공개</Radio.Button>
          <Radio.Button value={2}>비공개</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="제안삭제" name="delete">
        <Radio.Group size="large">
          <Radio.Button value={1}>삭제가능</Radio.Button>
          <Radio.Button value={2}>삭제불가</Radio.Button>
        </Radio.Group>
      </Form.Item>
      {/* <Form.Item label="방 공개(목록에서 표시여부)" name="room_open">
        <Radio.Group size="large">
          <Radio.Button value={1}>공개방</Radio.Button>
          <Radio.Button value={2}>비공개방</Radio.Button>
        </Radio.Group>
      </Form.Item> */}
      <Form.Item label="비밀번호" name="password">
        <Input
          type="text"
          placeholder="암호가 없으면 누구나 입장 가능합니다."
          maxLength={15}
        />
      </Form.Item>
    </>
  );
}
