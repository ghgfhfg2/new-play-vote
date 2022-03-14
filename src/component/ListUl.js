import React from 'react';
import style from "styles/list.module.css";
import Link from "next/link";
import { Popconfirm, message } from 'antd';
import {useRouter} from 'next/router';
import * as ioIcon from 'react-icons/io5'; 
import * as aiIcon from 'react-icons/ai';

function ListUl({listData, onDel, userUid}) {
  const router = useRouter();
  const path = router.pathname;
  
  return (
    <div className={style.list}>
      {listData.map((el, idx) => (
          <>
          <div className={style.list_box}>
            {el.ing ? (
              <span className={style.state_ing}></span>
              ):(
              <span className={style.state_end}></span>
            )}
            <Link href={`/view/${el.uid}`}>
            <a className={style.a} key={idx} >
              <dl>
                <dt>
                  <span className={style.tit}>{el.title}
                  {el.password && <aiIcon.AiOutlineLock style={{position:"relative",top:"2px",marginLeft:"5px"}} />}
                  </span>
                </dt>
                <dd>
                  <button type="button"><ioIcon.IoEnterOutline /></button>
                </dd>
              </dl>
              <ul className={style.tag_list}>
                {el.tag.map((tag,idx)=>(
                  <li>#{tag}</li>
                ))}
              </ul>
            </a>
            </Link>
            {el.host === userUid && 
              <Popconfirm
                title="해당 방을 삭제하시겠습니까?"
                onConfirm={()=>onDel(el.uid)}
                okText="네"
                cancelText="아니요"
              >
                <button type="button" className={style.btn_del}><aiIcon.AiOutlineDelete /></button>
              </Popconfirm>
            }
          </div>
          </>
        ))}
    </div>
  )
}

export default ListUl