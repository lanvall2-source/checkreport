// Vercel Serverless Function: 실시간 기기 동기화 API (스마트폰 ↔ PC)
import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

interface SyncPayload {
  roomId: string;
  data: any;
  updatedAt: number;
  sender?: string;
}

// 1. 메모리 캐시
declare global {
  // eslint-disable-next-line no-var
  var __checkreport_sync_store: Map<string, SyncPayload> | undefined;
}

if (!globalThis.__checkreport_sync_store) {
  globalThis.__checkreport_sync_store = new Map<string, SyncPayload>();
}

const store = globalThis.__checkreport_sync_store;

// 2. /tmp 파일시스템 헬퍼 (인스턴스 복원용)
const getTmpFilePath = (roomId: string) => {
  const safeId = roomId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join("/tmp", `checkreport_sync_${safeId}.json`);
};

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
    const roomId = (req.query.roomId as string) || "SITE-2026-001";
    let payload = store.get(roomId);

    // 메모리에 없으면 /tmp 파일에서 복원 시도
    if (!payload) {
      try {
        const tmpPath = getTmpFilePath(roomId);
        if (fs.existsSync(tmpPath)) {
          const content = fs.readFileSync(tmpPath, "utf-8");
          payload = JSON.parse(content);
          if (payload) store.set(roomId, payload);
        }
      } catch (e) {
        // ignore tmp read error
      }
    }

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
      const { roomId = "SITE-2026-001", data, sender = "mobile" } = req.body || {};

      if (!data) {
        return res.status(400).json({ success: false, error: "전송할 데이터가 누락되었습니다." });
      }

      const payload: SyncPayload = {
        roomId,
        data,
        updatedAt: Date.now(),
        sender,
      };

      // 메모리 저장
      store.set(roomId, payload);

      // /tmp 파일에 비동기 영속화
      try {
        const tmpPath = getTmpFilePath(roomId);
        fs.writeFileSync(tmpPath, JSON.stringify(payload), "utf-8");
      } catch (e) {
        // tmp write error ignore
      }

      // 캐시 크기 관리 (오래된 항목 정리)
      if (store.size > 150) {
        const oldestKey = store.keys().next().value;
        if (oldestKey) store.delete(oldestKey);
      }

      return res.status(200).json({
        success: true,
        roomId,
        updatedAt: payload.updatedAt,
        sender,
      });
    } catch (err: any) {
      console.error("Sync API POST Error:", err);
      return res.status(500).json({ success: false, error: err.message || "서버 동기화 처리 실패" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
