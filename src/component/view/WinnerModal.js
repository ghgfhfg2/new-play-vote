import React, { useState, useEffect } from "react";
import style from "../../../styles/view.module.css";
import { Image } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { AiOutlineTrophy } from "react-icons/ai";

function WinnerModal({ winner, finishPopClose }) {
  return (
    <>
      {winner && (
        <>
          <div className={style.view_finish_pop}>
            <article className={style.view_finish_con}>
              <div className={style.view_finish_txt}>
                1위로 선정된 제안 <AiOutlineTrophy />
              </div>
              <dl>
                <dt>{winner.title}</dt>
                <dd>
                  {winner.image && (
                    <div className="vote_img_list">
                      <Image.PreviewGroup>
                        {winner.image.map((src, idx) => (
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
                  {winner.link && (
                    <span className={style.vote_link}>
                      <a href={winner.link} target="_blank">
                        링크이동
                        <FiExternalLink />
                      </a>
                    </span>
                  )}
                </dd>
              </dl>
            </article>
            <div
              className={style.view_finish_bg}
              onClick={finishPopClose}
            ></div>
          </div>
        </>
      )}
    </>
  );
}

export default WinnerModal;
