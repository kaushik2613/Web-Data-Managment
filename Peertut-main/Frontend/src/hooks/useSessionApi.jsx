import { useAxios } from "./useAxios";

export const useSessionApi = () => {
  const { request } = useAxios();

  const getAllSessions = (tutorId) => request({ url: `sessions/all/${tutorId}`, method: "GET" });

  const createSession = (sessionData) =>
    request({ url: "/sessions/create-session", method: "POST", body: sessionData });

  const updateSession = (sessionId, updateData) =>
    request({ url: `/sessions/${sessionId}`, method: "PATCH", body: updateData });

  const deleteSession = (sessionId) =>
    request({ url: `/sessions/${sessionId}`, method: "DELETE" });

  const joinSession = (sessionId, studentId) =>
    request({ url: `/sessions/${sessionId}/join`, method: "POST", body: { studentId } });

  return {
    getAllSessions,
    createSession,
    updateSession,
    deleteSession,
    joinSession,
  };
};
