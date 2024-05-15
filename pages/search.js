import React, { useState, useEffect } from "react";
import { db } from "../src/firebase";
import { ref, get } from "firebase/database";
import { Input, Radio, message, Empty } from "antd";
import ListUl from "../src/component/ListUl";
const { Search } = Input;

function SearchPage() {
  const [listData, setListData] = useState();
  const onSearch = (e) => {
    const listRef = ref(db, `list_index/${e}`);
    get(listRef).then((data) => {
      if (!data.val()) {
        message.error("존재하지 않는 방 입니다.");
        return;
      }
      const path = `${data.val().path}/${e}`;
      get(ref(db, `list/${path}`)).then((data) => {
        let listArr = [];
        let obj = {
          ...data.val(),
          uid: data.key,
        };
        listArr.push(obj);
        setListData(listArr);
      });
    });
  };

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
      )}
    </>
  );
}

export default SearchPage;
