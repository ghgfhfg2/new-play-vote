import React, { useState, useRef } from "react";
import {
  AiOutlineLike,
  AiTwotoneLike,
  AiOutlineDislike,
  AiFillDislike,
  AiOutlineDelete,
} from "react-icons/ai";
import { IoIosList, IoIosReturnRight } from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaListUl } from "react-icons/fa";
import { AiOutlineEnter, AiOutlineCloseCircle } from "react-icons/ai";
import { BiMessageAdd } from "react-icons/bi";
import { Button, Image, Input, message } from "antd";
import style from "styles/view.module.css";

function RoomVote({
  userInfo,
  roomData,
  scrollBox,
  voteListData,
  listRef,
  voterRef,
  viewVoterList,
  onVote,
  onDisVote,
  onVoteRemove,
  addOpinion,
  onRemoveOp,
}) {
  //의견남기기

  const opInputRef = useRef();
  const opRef = useRef([]);
  const [opinionText, setOpinionText] = useState();
  const [curUid, setCurUid] = useState();
  const onChangeOpinion = (e) => {
    setOpinionText(e.target.value);
  };
  const showOpinionInput = (uid, txt) => {
    setOpinionText("");
    opInputRef.current.style.width = `${document.body.clientWidth - 30}px`;
    opInputRef.current.style.display = "flex";
    opInputRef.current.querySelector(
      "h2"
    ).innerHTML = `<span>"${txt}"</span> 에 대한 의견`;
    opInputRef.current.querySelector("input").focus();
    setCurUid(uid);
  };
  const hideOpinionInput = () => {
    opInputRef.current.style.display = "none";
    setOpinionText("");
  };
  const onAddOpinion = () => {
    addOpinion(curUid, opinionText).then((res) => {
      if (res) {
        hideOpinionInput();
      }
    });
  };
  const onOpinionPop = (idx) => {
    opRef.current[idx].style.display =
      opRef.current[idx].style.display == "flex" ? "none" : "flex";
    return;
  };

  return (
    <>
      <ul className={style.vote_list} ref={scrollBox}>
        {voteListData &&
          voteListData.map((el, idx) => (
            <li
              key={idx}
              ref={(list) => (listRef.current[idx] = list)}
              data-uid={el.uid}
            >
              <div className={style.profile}>
                {roomData && roomData.sender && roomData.sender === 1 && (
                  <span>{el.user_name}</span>
                )}
                <span
                  className={style.date}
                >{`${el.date.hour}:${el.date.min}`}</span>
              </div>
              <div className={style.con}>
                <div
                  className={style.desc}
                  style={roomData?.ing ? { marginRight: "10px" } : {}}
                >
                  <span className={style.vote_tit}>{el.title}</span>
                  {el.info && (
                    <span className={style.vote_info}>{el.info}</span>
                  )}
                  {el.image && (
                    <div className="vote_img_list">
                      <Image.PreviewGroup>
                        {el.image.map((src, idx) => (
                          <>
                            <Image
                              key={idx}
                              className={style.vote_img}
                              src={src}
                            />
                          </>
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  )}
                  {el.link && (
                    <span className={style.vote_link}>
                      <a
                        href={el.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        링크이동
                        <FiExternalLink />
                      </a>
                    </span>
                  )}
                  <div className={style.opinion_box}>
                    {roomData.ing && (
                      <button
                        type="button"
                        className={style.ic_add_op}
                        onClick={() => showOpinionInput(el.uid, el.title)}
                        title="의견추가"
                      >
                        <BiMessageAdd />
                      </button>
                    )}
                    {el.opinionList.length > 0 && (
                      <button
                        onClick={() => onOpinionPop(idx)}
                        type="button"
                        className={style.ic_op_list}
                        title="의견목록"
                      >
                        <FaListUl />
                      </button>
                    )}
                  </div>
                  {el.opinionList.length > 0 && (
                    <div
                      className={style.opinion_list_box}
                      style={{ display: "none" }}
                      ref={(op) => (opRef.current[idx] = op)}
                    >
                      <div className={style.opinion_list_scroll}>
                        <ul>
                          {el.opinionList.map((list) => (
                            <>
                              <li key={list.uid}>
                                <div>
                                  <IoIosReturnRight
                                    className={style.ic_arrow}
                                  />
                                  <span>{list.value}</span>
                                </div>
                                {userInfo.uid === list.uid && (
                                  <AiOutlineDelete
                                    className={style.ic_delete}
                                    onClick={() => onRemoveOp(el.uid, list.uid)}
                                  />
                                )}
                              </li>
                            </>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <div className={style.right_con}>
                  <div className={style.btn_box}>
                    <span className={style.count}>
                      {el.vote_count > 0 ? <>{el.vote_count}</> : `0`}
                    </span>
                    {userInfo && (
                      <Button
                        className={style.btn_vote}
                        onClick={() => {
                          onVote(
                            el.uid,
                            el.user_uid,
                            el.vote_user,
                            el.already_check
                          );
                        }}
                      >
                        {el.already_check ? (
                          <AiTwotoneLike className={style.ic_vote} />
                        ) : (
                          <AiOutlineLike className={style.ic_vote} />
                        )}
                      </Button>
                    )}
                  </div>
                  <div className={style.btn_box}>
                    <span className={style.count}>
                      {el.dis_vote_count > 0 ? <>{el.dis_vote_count}</> : `0`}
                    </span>
                    {userInfo && (
                      <Button
                        className={style.btn_vote}
                        onClick={() => {
                          onDisVote(
                            el.uid,
                            el.dis_user_uid,
                            el.vote_user,
                            el.dis_already_check
                          );
                        }}
                      >
                        {el.dis_already_check ? (
                          <AiFillDislike className={style.ic_vote2} />
                        ) : (
                          <AiOutlineDislike className={style.ic_vote2} />
                        )}
                      </Button>
                    )}
                  </div>
                  {roomData && roomData.voter === 1 && el.user_uid && (
                    <>
                      <button
                        type="button"
                        className={style.btn_vote_list_view}
                        onClick={() => {
                          viewVoterList(idx);
                        }}
                      >
                        <IoIosList />
                        좋아요 목록
                      </button>
                      <ul
                        style={{ display: "none" }}
                        ref={(voter) => (voterRef.current[idx] = voter)}
                      >
                        {el.user_uid.map((user, idx2) => (
                          <li key={idx2}>
                            {idx2 + 1} {user.name}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
              {roomData &&
                roomData.delete === 1 &&
                userInfo &&
                userInfo.uid === el.vote_user && (
                  <button
                    className={style.btn_vote_remove}
                    onClick={() => onVoteRemove(el.uid)}
                  >
                    <RiDeleteBinLine />
                  </button>
                )}
            </li>
          ))}
      </ul>
      <div className={style.opinion_input} ref={opInputRef}>
        <h2></h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input value={opinionText} onChange={onChangeOpinion} />
          <Button style={{ marginLeft: "5px" }} onClick={onAddOpinion}>
            <AiOutlineEnter />
          </Button>
          <AiOutlineCloseCircle
            onClick={hideOpinionInput}
            className={style.opinion_close}
          />
        </div>
      </div>
    </>
  );
}

export default RoomVote;
