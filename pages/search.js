import React, { useState, useEffect } from "react";
import { db } from "src/firebase";
import { ref, get } from "firebase/database";
import { Input, Radio, message, Empty } from "antd";
import ListUl from "../src/component/ListUl";
const { Search } = Input;


function SearchPage() {

  const [listData, setListData] = useState();
  const onSearch = (e) => {
      const listRef = ref(db, `list_index/${e}`);
      get(listRef)
      .then(data=>{
        const path = `${data.val().path}/${e}`;
        console.log(data.val().path)
        get(ref(db,`list/${path}`))
        .then(data=>{
          let listArr = [];
          listArr.push(data.val())
          console.log(listArr)
          setListData(listArr)
        })
      });
  }

  return (
    <>
      <div className="content_box list_content_box">
        <Search 
          placeholder="방 코드로 검색 가능합니다."  
          onSearch={onSearch} 
          enterButton 
          size="large" 
          className="search_input" 
        />
      </div>
      {listData && listData.length > 0 ? ( 
      <div className="content_box list_content_box">
        <ListUl listData={listData} />
      </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
      }
    </>
  )
}

export default SearchPage