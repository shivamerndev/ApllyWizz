FROM node:20-alpine AS frontend_builder

WORKDIR /frontend

COPY ./frontend/package*.json /frontend/

RUN npm install

COPY ./frontend /frontend/

RUN npm run build


# Stage 2: Run Backend (Application)

FROM node:20-alpine

WORKDIR /backend

COPY ./backend/package*.json /backend/

RUN npm install

COPY ./backend /backend/

COPY --from=frontend_builder /frontend/dist /backend/public

CMD [ "npm","start" ]