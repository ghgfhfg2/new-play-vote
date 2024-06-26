import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  ref,
  onValue,
  get,
  off,
  query,
  orderByChild,
  limitToLast,
  equalTo,
  orderByKey,
  orderByValue,
} from "firebase/database";
import ListUl from "./ListUl";
import { Input, Empty, Select, Button } from "antd";
import { getFormatDate } from "./CommonFunc";
const { Search } = Input;
const { Option } = Select;

function List() {
  const tagRefs = useRef([]);
  const [listData, setListData] = useState();
  const [bestTag, setBestTag] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState(1);
  let curDate = getFormatDate(new Date());
  let curDate_ = new Date();
  let prevDate_ = getFormatDate(
    new Date(curDate_.setDate(curDate_.getDate() - 1))
  );
  const [searchDate, setSearchDate] = useState(prevDate_);
  const onSearchType = (e) => {
    setSearchType(e);
  };
  const [tagList, setTagList] = useState();

  const onTagSearch = (tag, idx) => {
    tagRefs.current.forEach((el) => {
      el.classList.remove("on");
    });
    tagRefs.current[idx].classList.add("on");
    setBestTag(tag);
  };

  const listRef = ref(
    db,
    `list/${curDate.year}/${curDate.month}/${curDate.day}`
  );
  const fetchList = () => {
    let dataQuery;
    onValue(
      query(
        ref(db, `tag/${curDate.year}/${curDate.month}/${curDate.day}`),
        orderByValue(),
        limitToLast(1)
      ),
      (data) => {
        let tagArr = data.val() && Object.keys(data.val());
        setTagList(tagArr);

        dataQuery =
          searchType === 1 && bestTag
            ? query(listRef, orderByChild(`tag/${bestTag}`), equalTo(1))
            : query(listRef, orderByChild("date/day"), equalTo(curDate.day));

        onValue(dataQuery, (data) => {
          let listArr = [];
          data.forEach((el) => {
            if (searchType === 2 && searchKeyword !== "") {
              if (
                el.val().title.includes(searchKeyword) ||
                el.key === searchKeyword
              ) {
                listArr.push({
                  ...el.val(),
                  uid: el.key,
                });
              }
            } else {
              listArr.push({
                ...el.val(),
                uid: el.key,
              });
            }
          });

          listArr = listArr.filter((el) => el.room_open === 1);

          // tag를 객체에서 배열로 변환
          listArr.map((el) => {
            let tagArr = Object.keys(el.tag);
            el.tag = tagArr;
          });
          setListData(listArr);
        });
      }
    );
  };

  useEffect(() => {
    fetchList();

    return () => {
      off(listRef);
      off(ref(db, `tag/${curDate.year}/${curDate.month}/${curDate.day}`));
    };
  }, [searchKeyword, bestTag]);

  const getAddList = () => {
    let prevDateT = new Date(searchDate.timestamp);
    let prevDate = getFormatDate(prevDateT);
    get(
      ref(db, `list/${prevDate.year}/${prevDate.month}/${prevDate.day}`)
    ).then((data) => {
      let listArr = [];
      data.forEach((el) => {
        if (searchType === 2 && searchKeyword !== "") {
          if (
            el.val().title.includes(searchKeyword) ||
            el.key === searchKeyword
          ) {
            listArr.push({
              ...el.val(),
              uid: el.key,
            });
          }
        } else {
          listArr.push({
            ...el.val(),
            uid: el.key,
          });
        }
      });
      listArr = listArr.filter((el) => el.room_open === 1);

      // tag를 객체에서 배열로 변환
      listArr.map((el) => {
        let tagArr = Object.keys(el.tag);
        el.tag = tagArr;
      });
      setListData([...listData, ...listArr]);
      setSearchDate(
        getFormatDate(new Date(prevDateT.setDate(prevDateT.getDate() - 1)))
      );
    });
  };

  const onSearch = (e) => {
    if (e !== "") {
      setBestTag("");
      setSearchKeyword("");
      searchType === 1 ? setBestTag(e) : setSearchKeyword(e);
    }
  };

  return (
    <>
      <div className="content_box list_content_box top">
        <div className="search_input_box">
          <Select defaultValue={1} onChange={onSearchType}>
            <Option value={1}>태그</Option>
            <Option value={2}>제목</Option>
          </Select>
          <Search
            placeholder="검색어를 입력해주세요"
            onSearch={onSearch}
            enterButton
            size="large"
            className="search_input"
          />
        </div>
        {tagList && (
          <dl className="tag_list">
            <dt>인기태그</dt>
            <dd>
              {tagList.map((el, idx) => (
                <button
                  ref={(e) => (tagRefs.current[idx] = e)}
                  type="button"
                  key={idx}
                  onClick={() => onTagSearch(el, idx)}
                >
                  {el}
                </button>
              ))}
            </dd>
          </dl>
        )}
      </div>
      {listData && listData.length > 0 ? (
        <div className="content_box list_content_box">
          <ListUl listData={listData} />
          {/* <div style={{display:"flex",justifyContent:"center",marginTop:"20px"}}>
            <Button onClick={getAddList}>{searchDate.year}.{searchDate.month}.{searchDate.day} 보기</Button>
          </div> */}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      {/* <Link href="/regist">
        <button type="button" className="btn_write">
          <MdOutlinePlaylistAdd />
        </button>
      </Link> */}
    </>
  );
}

export default List;
