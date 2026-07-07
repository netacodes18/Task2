export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('datachat_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('datachat_session_id', sessionId);
  }
  return sessionId;
};

export const setSessionId = (newId: string): void => {
  if (newId && newId.trim() !== '') {
    localStorage.setItem('datachat_session_id', newId.trim());
  }
};
