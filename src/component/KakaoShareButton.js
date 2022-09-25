import React, { useState, useEffect } from "react";
import { RiKakaoTalkFill } from "react-icons/ri";
import style from "styles/view.module.css";

const KakaoShareButton = ({ roomData }) => {
  const [roomInfo, setRoomInfo] = useState();
  useEffect(() => {
    let roomInfoArr = [];
    roomInfoArr.push(roomData.type === 1 ? `#단일투표` : `#중복투표`);
    roomInfoArr.push(`#${roomData.max_vote}회 제안가능`);
    roomInfoArr.push(roomData.sender === 1 ? `#제안자공개` : `#제안자비공개`);
    roomInfoArr.push(roomData.voter === 1 ? `#투표자공개` : `#투표자비공개`);
    roomInfoArr.push(
      roomData.cancel === 1 ? `#투표 취소가능` : `#투표 취소불가`
    );
    roomInfoArr.push(roomData.room_open === 1 ? `#공개방` : `#비공개방`);
    roomData.add && roomData.add.includes("link") && roomInfoArr.push("#링크");
    roomData.add && roomData.add.includes("img") && roomInfoArr.push("#이미지");
    setRoomInfo(roomInfoArr.join(" "));
  }, [roomData]);

  useEffect(() => {
    createKakaoButton();
  }, [roomInfo]);

  const createKakaoButton = () => {
    if (window.Kakao) {
      const kakao = window.Kakao;
      // 중복 initialization 방지
      if (!kakao.isInitialized()) {
        kakao.init("8494f97dc8f42919153f027d0d4655b0");
      }

      kakao.Link.createDefaultButton({
        container: "#kakao-link-btn",
        objectType: "feed",
        content: {
          title: `${roomData.title}`,
          description: `${roomInfo}`,
          imageUrl: "IMAGE_URL", // i.e. process.env.FETCH_URL + '/logo.png'
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      });
    }
  };
  return (
    <button className={style.btn_kakao} id="kakao-link-btn">
      <RiKakaoTalkFill />
    </button>
  );
};

export default KakaoShareButton;
