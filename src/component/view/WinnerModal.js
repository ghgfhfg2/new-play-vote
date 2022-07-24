import React from 'react'
import style from "styles/view.module.css";
import {Image} from "antd"
import { FiExternalLink } from 'react-icons/fi';
import { AiOutlineTrophy } from 'react-icons/ai';

function WinnerModal({ranking,finishPopClose}) {
  return (
    <div className={style.view_finish_pop}>
      <article className={style.view_finish_con}>
        <div className={style.view_finish_txt}>1위로 선정된 제안 <AiOutlineTrophy /></div>
        <dl>
          <dt>
            {ranking[0].title}
          </dt>
          <dd>
            {ranking[0].image &&
            <div className="vote_img_list">
              <Image.PreviewGroup>
                {ranking[0].image.map((src,idx)=>(
                  <>
                  <Image key={idx} className={style.vote_img} src={src} />
                  </>
                  ))
                }
              </Image.PreviewGroup>
            </div>
            }
            {ranking[0].link &&
              <span className={style.vote_link}>
                <a href={ranking[0].link} target="_blank">링크이동<FiExternalLink /></a>
              </span>
            }
          </dd>
        </dl>
      </article>
      <div className={style.view_finish_bg} onClick={finishPopClose}>
      </div>
    </div>
  )
}

export default WinnerModal