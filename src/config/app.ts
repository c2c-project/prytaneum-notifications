import cookieParser from 'cookie-parser';
import logger from 'morgan';
import express, { Express } from 'express';
import cors from 'cors';

import './env'; // initializes env vars using our configuration

export default function (app: Express): void {
    // TODO: make this dev or prod mode
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false })); // TODO: read more about this
    app.use(cookieParser());
    app.use(
        cors({
            origin: 'http://localhost:3000',
            exposedHeaders: [
                'moc',
                'topic',
                'eventdatetime',
                'constituentscope',
                'region',
                'deliverytime',
            ],
        })
    );
}
