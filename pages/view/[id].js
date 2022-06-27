import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from 'next/router';
import { db } from "src/firebase";
import { ref, onValue, off, runTransaction, update } from "firebase/database";
import { Input, message, Button } from "antd";
import ViewCon from "@component/ViewCon";
import { RiArrowGoBackLine } from "react-icons/ri"
const { Search } = Input;


export default function View() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const router = useRouter();
  const uid = router.query.id;

  const [roomData, setRoomData] = useState();
  const [isJoin, setIsJoin] = useState(false);
  const [pwEnter, setPwEnter] = useState(true);
  useEffect(() => {
    const listRef = ref(db, `list/${uid}/`)
    onValue(listRef, data=>{
      let keys = Object.keys(data?.val()?.vote_user);
      if(userInfo && keys.includes(userInfo.uid)){
        data.val().password = '';
        setRoomData({
          ...data.val(),
          password:'',
          uid
        }) 
      }else{
        setRoomData({
          ...data.val(),
          uid
        })      
      }
    });

    onValue(ref(db,`vote_list/${uid}/`), data=>{
      let joinMember = [];
      data.forEach(el=>{
        el.val().user_uid.forEach(user=>{
          joinMember = [...joinMember,user.uid]
        })
      })
      userInfo && userInfo.uid && joinMember.includes(`${userInfo.uid}`) ? setIsJoin(true) : null;
    })
    if(uid){
      runTransaction(ref(db, `list/${uid}/join_count`), pre => {
        return pre ? pre+1 : 1;
      })
    }

    return () => {
      off(listRef)
    };
  }, [pwEnter]);

  const [pwInput, setPwInput] = useState();

  const onPw = (e) => {
    setPwInput(e.target.value)
  }
  
  const onSearch = () => {
    const pw = roomData.password
    if(pwInput == pw){
      setPwEnter(false);
      message.success('입장에 성공했습니다 :)')
    }else{
      message.error('암호가 틀렸습니다.');
    }
  }

  const onBack = () => {
    router.back()
  }
  
  return (
    <>
      {roomData && (
        <>
        {roomData.password && pwEnter && !isJoin ? (
          <>
            <div className="content_box pw_box">
              <div className="flex_box">
                <Input.Password onChange={onPw} placeholder="input password" />
                <Button style={{marginLeft:"5px"}} onClick={onSearch}>확인</Button>
              </div>
              <Button className="back" onClick={onBack}><RiArrowGoBackLine />돌아가기</Button>
            </div>
          </>
          ):(
          <>  
             <ViewCon uid={uid} />
          </>
          )}
        </>
        )
      }
    </>
  );
}
