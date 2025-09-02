import { DynamoDBDocument, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../../modules/external/dynamo/dynamoClient';
import { SecurityLog } from '../types/security';
import { FormattedDate, UnixTimestamp, createFormattedDate, createUnixTimestamp } from '../../../types/dates';

// Configurar cliente DynamoDB con removeUndefinedValues automático
const docClient = DynamoDBDocument.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

const TABLE_NAME = 'logs_front';

interface DynamoLogItem {
  // Claves principales - Partición por fecha
  datePartition: string;      // DATE#YYYY-MM-DD
  timelineSort: string;       // TIME#timestamp#ip#eventType#level
  
  // GSI1: Consultas por IP
  ipPartition: string;        // IP#192.168.1.1
  ipTimestamp: string;        // TIME#timestamp
  
  // GSI2: Consultas por tipo de evento
  eventPartition: string;     // EVENT#security_threat
  eventTimestamp: string;     // TIME#timestamp#level
  
  // GSI3: Consultas por nivel de severidad
  levelPartition: string;     // LEVEL#error
  levelTimestamp: string;     // TIME#timestamp#ip
  
  // Datos del log
  timestamp: UnixTimestamp;
  formattedDate: FormattedDate;
  ttl: number;
  level: string;
  eventType: string;
  ip: string;
  logData: SecurityLog;
}

interface QueryOptions {
  limit?: number;
  startKey?: Record<string, string | number>;
}

interface QueryResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, string | number>;
  count: number;
}

export class DynamoLogService {
  /**
   * Limpia valores undefined de un objeto usando JSON parse/stringify
   * Esta es la forma más simple y confiable de remover undefined values
   */
  private static cleanUndefinedValues<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  /**
   * Guarda un log de seguridad en DynamoDB
   */
  static async saveSecurityLog(securityLog: SecurityLog): Promise<void> {
    try {
      const now = new Date();
      const timestamp = createUnixTimestamp(now);
      const formattedDate = createFormattedDate(now);
      const dateOnly = formattedDate.split(' ')[0]; // YYYY-MM-DD
      
      // TTL: 90 días desde ahora
      const ttl = createUnixTimestamp(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
      
      // Limpiar el securityLog de valores undefined
      const cleanedSecurityLog = this.cleanUndefinedValues(securityLog);
      
      const item: DynamoLogItem = {
        // Claves principales - Partición por fecha
        datePartition: `DATE#${dateOnly}`,
        timelineSort: `TIME#${timestamp}#${securityLog.clientInfo.ip}#${securityLog.eventType}#${securityLog.level}`,
        
        // GSI1: Consultas por IP
        ipPartition: `IP#${securityLog.clientInfo.ip}`,
        ipTimestamp: `TIME#${timestamp}`,
        
        // GSI2: Consultas por tipo de evento
        eventPartition: `EVENT#${securityLog.eventType}`,
        eventTimestamp: `TIME#${timestamp}#${securityLog.level}`,
        
        // GSI3: Consultas por nivel de severidad
        levelPartition: `LEVEL#${securityLog.level}`,
        levelTimestamp: `TIME#${timestamp}#${securityLog.clientInfo.ip}`,
        
        // Datos del log
        timestamp,
        formattedDate,
        ttl,
        level: securityLog.level,
        eventType: securityLog.eventType,
        ip: securityLog.clientInfo.ip,
        logData: cleanedSecurityLog
      };

      // Limpiar el item completo de valores undefined
      const cleanedItem = this.cleanUndefinedValues(item);

      await docClient.put({
        TableName: TABLE_NAME,
        Item: cleanedItem
      });

    } catch (error) {
      console.error('Error guardando log en DynamoDB:', error);
      // Re-lanzar el error para que el caller pueda manejar el fallback
      throw error;
    }
  }

  /**
   * Guarda múltiples logs en batch (hasta 25 items)
   */
  static async batchSaveSecurityLogs(securityLogs: SecurityLog[]): Promise<void> {
    if (securityLogs.length === 0) return;
    
    // DynamoDB batch write máximo 25 items
    const chunks = this.chunkArray(securityLogs, 25);
    
    for (const chunk of chunks) {
      try {
        const writeRequests = chunk.map(log => {
          const now = new Date();
          const timestamp = createUnixTimestamp(now);
          const formattedDate = createFormattedDate(now);
          const dateOnly = formattedDate.split(' ')[0];
          const ttl = createUnixTimestamp(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
          
          // Limpiar el log de valores undefined
          const cleanedLog = this.cleanUndefinedValues(log);
          
          const item: DynamoLogItem = {
            datePartition: `DATE#${dateOnly}`,
            timelineSort: `TIME#${timestamp}#${log.clientInfo.ip}#${log.eventType}#${log.level}`,
            ipPartition: `IP#${log.clientInfo.ip}`,
            ipTimestamp: `TIME#${timestamp}`,
            eventPartition: `EVENT#${log.eventType}`,
            eventTimestamp: `TIME#${timestamp}#${log.level}`,
            levelPartition: `LEVEL#${log.level}`,
            levelTimestamp: `TIME#${timestamp}#${log.clientInfo.ip}`,
            timestamp,
            formattedDate,
            ttl,
            level: log.level,
            eventType: log.eventType,
            ip: log.clientInfo.ip,
            logData: cleanedLog
          };

          // Limpiar el item completo de valores undefined
          const cleanedItem = this.cleanUndefinedValues(item);

          return {
            PutRequest: {
              Item: cleanedItem
            }
          };
        });

        await docClient.batchWrite({
          RequestItems: {
            [TABLE_NAME]: writeRequests
          }
        });

      } catch (error) {
        console.error('Error en batch write DynamoDB:', error);
        throw error;
      }
    }
  }

  /**
   * Consulta logs por fecha específica
   */
  static async queryLogsByDate(
    date: string, // YYYY-MM-DD format
    options: QueryOptions = {}
  ): Promise<QueryResult<DynamoLogItem>> {
    try {
      const result = await docClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'datePartition = :datePartition',
        ExpressionAttributeValues: {
          ':datePartition': `DATE#${date}`
        },
        Limit: options.limit,
        ExclusiveStartKey: options.startKey,
        ScanIndexForward: false // Más recientes primero
      });
      
      return {
        items: result.Items as DynamoLogItem[],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0
      };
    } catch (error) {
      console.error('Error consultando logs por fecha:', error);
      throw error;
    }
  }

  /**
   * Consulta logs por IP específica
   */
  static async queryLogsByIP(
    ip: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<DynamoLogItem>> {
    try {
      const result = await docClient.query({
        TableName: TABLE_NAME,
        IndexName: 'ip-index',
        KeyConditionExpression: 'ipPartition = :ipPartition',
        ExpressionAttributeValues: {
          ':ipPartition': `IP#${ip}`
        },
        Limit: options.limit,
        ExclusiveStartKey: options.startKey,
        ScanIndexForward: false
      });
      
      return {
        items: result.Items as DynamoLogItem[],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0
      };
    } catch (error) {
      console.error('Error consultando logs por IP:', error);
      throw error;
    }
  }

  /**
   * Consulta logs por tipo de evento
   */
  static async queryLogsByEventType(
    eventType: string,
    level?: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<DynamoLogItem>> {
    try {
      let keyConditionExpression = 'eventPartition = :eventPartition';
      const expressionAttributeValues: Record<string, string | number> = {
        ':eventPartition': `EVENT#${eventType}`
      };

      if (level) {
        keyConditionExpression += ' AND begins_with(eventTimestamp, :eventTimestamp_prefix)';
        expressionAttributeValues[':eventTimestamp_prefix'] = `TIME#`;
        // Para filtrar por level específico, usaremos FilterExpression
      }

      const queryParams: QueryCommandInput = {
        TableName: TABLE_NAME,
        IndexName: 'eventType-index',
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: options.limit,
        ExclusiveStartKey: options.startKey,
        ScanIndexForward: false
      };

      if (level) {
        queryParams.FilterExpression = '#level = :level';
        queryParams.ExpressionAttributeNames = { '#level': 'level' };
        if (queryParams.ExpressionAttributeValues) {
          queryParams.ExpressionAttributeValues[':level'] = level;
        }
      }

      const result = await docClient.query(queryParams);
      
      return {
        items: result.Items as DynamoLogItem[],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0
      };
    } catch (error) {
      console.error('Error consultando logs por evento:', error);
      throw error;
    }
  }

  /**
   * Consulta logs por nivel de severidad
   */
  static async queryLogsByLevel(
    level: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<DynamoLogItem>> {
    try {
      const result = await docClient.query({
        TableName: TABLE_NAME,
        IndexName: 'level-index',
        KeyConditionExpression: 'levelPartition = :levelPartition',
        ExpressionAttributeValues: {
          ':levelPartition': `LEVEL#${level}`
        },
        Limit: options.limit,
        ExclusiveStartKey: options.startKey,
        ScanIndexForward: false
      });
      
      return {
        items: result.Items as DynamoLogItem[],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0
      };
    } catch (error) {
      console.error('Error consultando logs por nivel:', error);
      throw error;
    }
  }

  /**
   * Consulta logs en un rango de tiempo específico
   */
  static async queryLogsByTimeRange(
    date: string, // YYYY-MM-DD
    startTimestamp: UnixTimestamp,
    endTimestamp: UnixTimestamp,
    options: QueryOptions = {}
  ): Promise<QueryResult<DynamoLogItem>> {
    try {
      const result = await docClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'datePartition = :datePartition AND timelineSort BETWEEN :start_timeline AND :end_timeline',
        ExpressionAttributeValues: {
          ':datePartition': `DATE#${date}`,
          ':start_timeline': `TIME#${startTimestamp}`,
          ':end_timeline': `TIME#${endTimestamp}`
        },
        Limit: options.limit,
        ExclusiveStartKey: options.startKey,
        ScanIndexForward: false
      });
      
      return {
        items: result.Items as DynamoLogItem[],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0
      };
    } catch (error) {
      console.error('Error consultando logs por rango de tiempo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de logs por fecha
   */
  static async getLogStatsByDate(date: string): Promise<{
    totalLogs: number;
    byLevel: Record<string, number>;
    byEventType: Record<string, number>;
    uniqueIPs: number;
  }> {
    try {
      const result = await docClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'datePartition = :datePartition',
        ExpressionAttributeValues: {
          ':datePartition': `DATE#${date}`
        }
      });
      
      const items = result.Items as DynamoLogItem[];
      const stats = {
        totalLogs: items.length,
        byLevel: {} as Record<string, number>,
        byEventType: {} as Record<string, number>,
        uniqueIPs: 0
      };
      
      const uniqueIPs = new Set<string>();
      
      items.forEach(item => {
        // Contar por level
        stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
        
        // Contar por eventType
        stats.byEventType[item.eventType] = (stats.byEventType[item.eventType] || 0) + 1;
        
        // IPs únicas
        uniqueIPs.add(item.ip);
      });
      
      stats.uniqueIPs = uniqueIPs.size;
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Utility function para dividir arrays en chunks
   */
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
