// Vercel Serverless Function: 실시간 기기 동기화 API (스마트폰 ↔ PC)
import type { VercelRequest, VercelResponse } from "@vercel/node";

interface SyncPayload {
  roomId: string;
  data: any;
  updatedAt: number;
  sender?: string;
}

// 인메모리 임시 캐시 (최대 100개 룸, 2시간 유지)
declare global {
  // eslint-disable-next-line no-var
  var __checkreport_sync_store: Map<string, SyncPayload> | undefined;
}

if (!globalThis.__checkreport_sync_store) {
  globalThis.__checkreport_sync_store = new Map<string, SyncPayload>();
}

const store = globalThis.__checkreport_sync_store;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. GET: 특정 roomId의 최신 데이터 조회
  if (req.method === "GET") {
    const roomId = (req.query.roomId as string) || "demo-room";
    const payload = store.get(roomId);

    if (!payload) {
      return res.status(200).json({
        success: true,
        exists: false,
        roomId,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      exists: true,
      roomId,
      data: payload.data,
      updatedAt: payload.updatedAt,
      sender: payload.sender,
    });
  }

  // 2. POST: 데이터 업데이트
  if (req.method === "POST") {
    try {
      const { roomId = "demo-room", data, sender = "mobile" } = req.body || {};

      if (!data) {
        return res.status(400).json({ success: false, error: "데이터가 누락되었습니다." });
      }

      const payload: SyncPayload = {
        roomId,
        data,
        updatedAt: Date.now(),
        sender,
      };

      store.set(roomId, payload);

      // 캐시 크기 관리 (오래된 항목 정리)
      if (store.size > 100) {
        const oldestKey = store.keys().next().value;
        if (oldestKey) store.delete(oldestKey);
      }

      return res.status(200).json({
        success: true,
        roomId,
        updatedAt: payload.updatedAt,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "서버 동기화 오류" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
