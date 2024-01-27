"use server";
import { Article } from "@/types";

export async function fetchBeers(page: number) {
  const perPage = 25;
  const apiUrl = `https://api.mosaiquefm.net/api/ar/${perPage}/${page}/articles`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data?.items as Article[];
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
