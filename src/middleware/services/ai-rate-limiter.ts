import { NextRequest } from 'next/server';
import { 
  GetItemCommand, 
  UpdateItemCommand 
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dynamoDBClient } from 'modules/external/dynamo/dynamoClient';

const tableName = "ip-rate-limit";

export function getIP(request: NextRequest) {
  const xff = request.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0] : '127.0.0.1';
}

export async function getIPRequestCount(ip: string): Promise<number> {
  const params = {
    TableName: tableName,
    Key: marshall({ ip }),
  };

  try {
    const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
    if (Item) {
      const unmarshalledItem = unmarshall(Item);
      // Check if TTL has expired
      if (unmarshalledItem.ttl && unmarshalledItem.ttl < Math.floor(Date.now() / 1000)) {
        return 0;
      }
      return unmarshalledItem.requestCount || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting IP request count:", error);
    return 0; // Fail open
  }
}

export async function incrementIPRequestCount(ip: string, windowInSeconds: number): Promise<void> {
  const ttlValue = Math.floor(Date.now() / 1000) + windowInSeconds;

  const params = {
    TableName: tableName,
    Key: marshall({ ip }),
    UpdateExpression: "SET requestCount = if_not_exists(requestCount, :start) + :inc, #ttl = :ttlValue",
    ExpressionAttributeNames: {
      "#ttl": "ttl",
    },
    ExpressionAttributeValues: marshall({
      ":inc": 1,
      ":start": 0,
      ":ttlValue": ttlValue,
    }),
  };

  try {
    await dynamoDBClient.send(new UpdateItemCommand(params));
  } catch (error) {
    console.error("Error incrementing IP request count:", error);
  }
}
