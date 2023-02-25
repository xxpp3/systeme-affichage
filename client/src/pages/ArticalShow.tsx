//@ts-nocheck
import { useState } from "react";
import { useEffect, useCallback } from "react";
import axios from "../api";
import {
  CenterDiv,
  Card,
  Title,
  Parag,
  Niveau,
  CardVoid,
} from "./styles/ArticalShow.style";

type article = {
  titre: string;
  contenu: string;
  niveau: string[];
};

type allArticles = {
  L1: article[] | undefined;
  L2: article[] | undefined;
  L3: article[] | undefined;
  M1: article[] | undefined;
  M2: article[] | undefined;
  D: article[] | undefined;
};

export default function ArticalShow() {
  const [articles, setArticles] = useState<allArticles | undefined>();
  const [data, setData] = useState<article[]>();
  const [count, setCount] = useState([0, 0, 0, 0, 0, 0]);

  const getData = useCallback(async () => {
    try {
      const res = await axios.get("/affichage");

      if (res.status === 200) {
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const filterData = useCallback(() => {
    const niveaux = ["L1", "L2", "L3", "M1", "M2", "D"];
    let filtered: allArticles = {
      L1: undefined,
      L2: undefined,
      L3: undefined,
      M1: undefined,
      M2: undefined,
      D: undefined,
    };

    niveaux.map((niveau: any) => {
      filtered[niveau as keyof typeof filtered] = data?.filter(
        (article: article) => article.niveau.includes(niveau)
      ) as article[];
    });

    setArticles(filtered);
  }, [data]);

  useEffect(() => {
    // const controller = new AbortController();
    getData();

    // return () => controller.abort();
  }, []);

  useEffect(() => {
    if (data) filterData();
  }, [data]);

  useEffect(() => {
    let slideTimer: any;
    if (articles) {
      slideTimer = setTimeout(() => {
        const niveaux = ["L1", "L2", "L3", "M1", "M2", "D"];

        setCount((prev) =>
          prev.map((el, idx) => {
            if (!articles[niveaux[idx] as keyof typeof articles]?.length)
              return 0;
            return el !==
              //@ts-ignore
              articles[niveaux[idx] as keyof typeof articles].length - 1
              ? el + 1
              : 0;
          })
        );
      }, 15000);
    }

    return () => clearTimeout(slideTimer);
  }, [count, articles]);

  return (
    <CenterDiv>
      {articles &&
        Object.keys(articles).map((art, key) => {
          return articles[art as keyof allArticles][count[key]] ? (
            <Card>
              <Title>{articles[art][count[key]].titre}</Title>
              <Parag>{articles[art][count[key]].contenu}</Parag>
              <Niveau>{articles[art][count[key]].niveau}</Niveau>
            </Card>
          ) : (
            <CardVoid>
              <Title>Pas D'affichage</Title>
            </CardVoid>
          );
        })}
    </CenterDiv>
  );
}
