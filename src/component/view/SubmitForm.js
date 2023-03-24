import React from "react";
import { AiOutlineUpload, AiOutlineDelete } from "react-icons/ai";
import form from "styles/form.module.css";
import { Form, Input, Button } from "antd";
import style from "styles/view.module.css";
import { useState, useEffect } from "react";

function SubmitForm({
  roomData,
  onFinish,
  formRef,
  clipImg,
  removeClipImg,
  clipboard,
}) {
  return (
    <Form
      name="basic"
      onFinish={onFinish}
      autoComplete="off"
      className={form.form}
      ref={formRef}
    >
      <Form.Item
        className={form.item}
        name="title"
        rules={[{ required: true, message: "제목은 필수입니다." }]}
      >
        <Input placeholder="*제목" />
      </Form.Item>
      <Form.Item className={form.item} name="info">
        <Input placeholder="설명" />
      </Form.Item>
      {roomData && roomData.add && roomData.add.includes("link") && (
        <Form.Item className={form.item} name="link">
          <Input placeholder="링크주소" />
        </Form.Item>
      )}
      {roomData && roomData.add && roomData.add.includes("img") && (
        <>
          <div className={style.img_upload_box}>
            <Input onPaste={clipboard} placeholder="복사한 이미지 붙여넣기" />
            <div className={style.input_file}>
              <input type="file" id="img_file" onChange={clipboard} />
              <label htmlFor="img_file">
                <AiOutlineUpload />
                이미지 첨부
              </label>
            </div>
          </div>
          {clipImg &&
            clipImg.map((el, idx) => (
              <div
                className={style.img_upload_list}
                key={`${idx}_${el.fileName}`}
              >
                <img src={el.thumbnail} />
                <span>{el.fileName}</span>
                <button type="button" onClick={() => removeClipImg(idx)}>
                  <AiOutlineDelete />
                </button>
              </div>
            ))}
        </>
      )}
      <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
        제안하기
      </Button>
    </Form>
  );
}

export default SubmitForm;
