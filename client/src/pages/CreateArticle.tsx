import { useState, useEffect, useCallback } from "react";
import { Input, DatePicker, Button, message } from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import dayjs from "dayjs";

import { Form, Wrapper } from "./styles/CreateArticles.styles";
import NiveauCheckBox from "../components/CheckboxGroup";
import { useAuth } from "../context/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { AxiosRequestConfig } from "axios";

type data = {
  titre: string;
  contenu: string;
  date_debut: string;
  date_fin: string;
  niveau: string[];
  category_id: number;
};

export default function CreateArticle() {
  //@ts-ignore
  const { token } = useAuth();
  const axios = useAxios();
  const location = useLocation();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState<boolean>(false);

  const [titre, setTitre] = useState<string>("");
  const [contenu, setContenu] = useState<string>("");
  const [niveau, setNiveau] = useState<CheckboxValueType[]>([]);
  const [dateDebut, setDateDebut] = useState<string>();
  const [dateFin, setDateFin] = useState<string>();
  const [boolean, setBoolean] = useState(false);
  function dateChangeHandler(value: any) {
    console.log(value[0]);
    console.log(value[1]);
    setDateDebut(value[0].$d.toISOString());
    setDateFin(value[1].$d.toISOString());
  }

  async function onFinish() {
    setLoading(true);
    console.log("finish function");
    if (!dateDebut || !dateFin) {
      console.log("this is dateDebut" + dateDebut);
      console.log("this is dateFin" + dateFin);
      //TODO: alert the user
      return;
    }
    console.log("after if conditon");
    try {
      let config: AxiosRequestConfig;

      if (location.pathname.includes("/archive/edit")) {
        const id = location.pathname.split("/").at(-1);

        config = {
          method: "put",
          url: `/articles/${id}`,
        };
      } else {
        config = {
          method: "post",
          url: `/articles`,
        };
      }

      const data: data = {
        titre,
        contenu,
        date_debut: dateDebut,
        date_fin: dateFin,
        niveau: niveau as string[],
        category_id: 1,
      };

      const res = await axios({
        ...config,
        data,
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        messageApi.open({
          type: "success",
          content: "Article créé",
        });
        console.log("im in 200");
        //empty fields
        setTitre("");
        setContenu("");
        setNiveau([]);
        console.log("i got erased");
      } else if (res.status === 204) {
        messageApi.open({
          type: "success",
          content: "Article édité",
        });
        console.log("im in edit");
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: "error",
        content: "Erreur",
      });
    } finally {
      setLoading(false);
    }
   
  }
  
  const getData = useCallback(async (controller: AbortController) => {
    const id = location.state?.data?.article_id;
    if (id) {
      const url = `/articles/${id}`;
      const res = await axios.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (res.status === 200) {
        setTitre(res.data.data.titre);
        setContenu(res.data.data.contenu);
        setNiveau(res.data.data.niveau);
        setDateDebut(res.data.data.date_debut);
        setDateFin(res.data.data.date_fin);
        
      }
    }
  }, []);
/*   useEffect(() => {
    setBoolean(false);
  }, [boolean]); */
  useEffect(() => {
    const controller = new AbortController();
    getData(controller);
    return () => controller.abort();
  }, []);

  return (
    <Wrapper>
      {contextHolder}
      <Form
        form={form}
        labelAlign={"left"}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        onSubmitCapture={() => {}}
      >
        <Form.Item
          label="titre"
          rules={[{ required: true, message: "Please input your name" }]}
          requiredMark={true}
        >
          <Input
            value={titre}
            required
            onChange={(e) => setTitre(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="contenu"
          rules={[{ required: true }]}
          requiredMark={true}
        >
          <Input.TextArea
            value={contenu}
            required
            onChange={(e) => setContenu(e.target.value)}
            style={{ height: 120, resize: "none" }}
          />
        </Form.Item>
        <Form.Item label="Niveaux">
          <NiveauCheckBox checkedList={niveau} setCheckedList={setNiveau} />
        </Form.Item>
        <Form.Item label="Durée">
          {location.pathname.includes("/archive/edit") ? (
            dateDebut && dateFin ? (
              <DatePicker.RangePicker
                defaultValue={[
                  dayjs(
                    dateDebut?.replace("T", " ").split(".")[0],
                    "YYYY-MM-DD HH:mm:ss"
                  ),
                  dayjs(
                    dateFin?.replace("T", " ").split(".")[0],
                    "YYYY-MM-DD HH:mm:ss"
                  ),
                ]}
                allowEmpty={[false, false]}
                onChange={(value) => dateChangeHandler(value)}
                placeholder={["de", "à"]}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [
                    dayjs("00:00:00", "HH:mm:ss"),
                    dayjs("11:59:59", "HH:mm:ss"),
                  ],
                }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            ) : null
          ) : (
            <DatePicker.RangePicker
              allowEmpty={[false, false]}
              onChange={(value) => dateChangeHandler(value)}
              placeholder={["de", "à"]}
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [
                  dayjs("00:00:00", "HH:mm:ss"),
                  dayjs("11:59:59", "HH:mm:ss"),
                ],
              }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          )}
        </Form.Item>
        <Form.Item label=" " colon={false}>
          <Button loading={loading} htmlType="submit" type="primary">
            Valider
          </Button>
        </Form.Item>
      </Form>
    </Wrapper>
  );
}
