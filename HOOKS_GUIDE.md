# React hooks guide

- `useState`: component ki changing value rakhta hai. Is app mein login form values, tasks, selected filter, loading/errors, aur task edit state is se manage hoti hai.
- `useEffect`: render ke bahar ke kaam karta hai aur zaroorat par cleanup deta hai. App `/me` se saved session verify karta hai; Workspace tasks load karta hai; TaskRow edit mode khulte hi input focus karta hai.
- `useMemo`: dependencies badalne par hi calculated value dobara nikalta hai. Workspace mein `tasks` aur `filter` se visible tasks banata hai.
- `useRef`: aisi value/DOM reference rakhta hai jo badalne par rerender nahi karati. TaskRow mein edit input ko focus karne ke liye use hota hai.
- `useContext`: provider se shared value ko component tree mein kahin bhi parhne deta hai, bina props har layer se pass kiye. `useAuth()` shared user aur logout action deta hai.

`useAuth` is project ka custom hook hai. Yeh `useContext(AuthContext)` ko wrap karta hai aur guard karta hai ke hook provider ke andar hi use ho.
