declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV?: 'development' | 'production' | 'test';
            PORT?: string;
            ORIGIN?: string;
            DB_URL?: string;
            MAILGUN_ORIGIN?: string;
            MAILGUN_API_KEY?: string,
            MAILGUN_DOMAIN?: string,
            MAILGUN_FROM_EMAIL?: string,
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
