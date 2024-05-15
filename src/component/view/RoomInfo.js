import React, { useState } from "react";
import style from "../../../styles/view.module.css";
import { IoExitOutline } from "react-icons/io5";
import KakaoShareButton from "../KakaoShareButton";
import { AiOutlineShareAlt } from "react-icons/ai";
import { FiCopy } from "react-icons/fi";
import { message } from "antd";
import { copyText } from "../CommonFunc";

function RoomInfo({ roomData, onOutView, roomUid }) {
  const [isShareList, setIsShareList] = useState(false);
  const onShareList = () => {
    setIsShareList(!isShareList);
  };
  const onCopyCode = () => {
    copyText(roomUid, () => {
      message.success("방 코드가 복사되었습니다.");
    });
  };
  return (
    <div className={style.room_data}>
      <div className={style.room_left}>
        <ul className={style.room_info}>
          <li>{roomData.type === 1 ? `단일투표` : `중복투표`}</li>
          <li>{`${roomData.max_vote}회 제안가능`}</li>
          <li>{roomData.sender === 1 ? `제안자공개` : `제안자비공개`}</li>
          <li>{roomData.voter === 1 ? `투표자공개` : `투표자비공개`}</li>
          <li>{roomData.cancel === 1 ? `투표 취소가능` : `투표 취소불가`}</li>
          <li>{roomData.delete === 1 ? `제안 취소가능` : `제안 취소불가`}</li>
          <li>{roomData.room_open === 1 ? `공개방` : `비공개방`}</li>
          <li>
            {roomData.finish_type === 1
              ? `방장종료`
              : `${roomData.finish_count}표 달성시 종료`}
          </li>
          <li>
            {roomData.timer_type === 1
              ? `시간 무제한`
              : `${roomData.timer_time}분 제한`}
          </li>
          {roomData.add && roomData.add.includes("link") && <li>링크</li>}
          {roomData.add && roomData.add.includes("img") && <li>이미지</li>}
        </ul>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span
            style={{ fontSize: "13px", fontWeight: "600" }}
          >{`코드명 : ${roomUid}`}</span>
          <button
            type="button"
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "5px 6px",
              marginLeft: "6px",
              fontSize: "12px",
            }}
            onClick={onCopyCode}
          >
            <FiCopy />
            코드복사
          </button>
        </div>
        <h2>{roomData.title}</h2>
      </div>
      <div className={style.room_top_right}>
        <button type="button" className={style.room_out} onClick={onOutView}>
          <IoExitOutline />
        </button>
        <button type="button" className="ic_share" onClick={onShareList}>
          <AiOutlineShareAlt />
        </button>
        <div className={isShareList ? "share_list on" : "share_list"}>
          <KakaoShareButton roomData={roomData} />
        </div>
      </div>
    </div>
  );
}

export default RoomInfo;
