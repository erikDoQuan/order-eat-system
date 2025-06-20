import { Module } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ClsService],
      useFactory: (cls: ClsService) => {
        return {
          pinoHttp: {
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
                levelFirst: true,
                translateTime: 'yyyy-mm-dd HH:MM:ssp',
                destination: 1,
              },
            },
            autoLogging: false,
            genReqId: (req, res) => {
              const requestId = cls.getId() ?? crypto.randomUUID();
              res.setHeader('x-request-id', requestId);
              return requestId;
            },
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.creditCard', 'pid'],
              remove: true,
            },
            quietReqLogger: true,
            customAttributeKeys: {
              reqId: 'requestId',
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
