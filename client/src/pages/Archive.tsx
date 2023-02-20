import { useState, useCallback, useEffect } from "react";

import { message, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete, MdOutlinePreview } from "react-icons/md";

import Link from "../components/shared/Link";
import { Div } from "./styles/Archive.style";
import { useAuth } from "../context/AuthProvider";
import axios from "../api";

interface DataType {
  article_id: string;
  titre: string;
  categorie: string;
  created_at: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: "Titre",
    dataIndex: "titre",
    key: "titre",
  },
  {
    title: "Categorie",
    dataIndex: "categorie",
    key: "categorie",
  },
  {
    title: "Date",
    dataIndex: "created_at",
    key: "date",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Link to={`archive/edit/${record.article_id}`} state={{ data: record }}>
          <AiOutlineEdit style={{ fontSize: "18px" }} />
        </Link>
        <Link to={`/archive/${record.article_id}`}>
          <MdOutlinePreview />
        </Link>
        <div onClick={() => {}}>
          <MdOutlineDelete />
        </div>
      </Space>
    ),
  },
];

export default function Archive() {
  //@ts-ignore
  const { token } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState<DataType[]>([]);

  const getArticles = useCallback(
    async (controller: AbortController) => {
      try {
        const res = await axios.get("/articles", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.status === 200) {
          const newData = res.data.data.map((el: DataType) => {
            el.created_at = el.created_at.replace("T", " ").split(".")[0];
            return el;
          });
          setData(newData);
          
        }
      } catch (error: any) {
        
        if (error.response?.status === 403) {
          
          messageApi.open({
            type: "error",
            content: "Please log in",
          });
        }
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();
    getArticles(controller);

    return () => controller.abort();
  }, []);

  return (
    <Div>
      {contextHolder}
      <Table columns={columns} dataSource={data} />
    </Div>
  );
}
