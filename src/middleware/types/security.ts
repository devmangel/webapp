import { NextRequest } from 'next/server';

export interface BotDetection {
  name: string;
  category: 'search_engine' | 'crawler' | 'social_media' | 'security_tool' | 'scanner' | 'malicious' | 'unknown';
  confidence: number;
  description?: string;
}

export interface SecurityThreat {
  type: 'path' | 'method' | 'header' | 'query' | 'payload' | 'rate' | 'anomaly';
  subType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  suggestedAction?: string;
}

export interface SecurityLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  eventType: 'request' | 'security_threat' | 'bot_detection' | 'auth_failure' | 'rate_limit';
  clientInfo: {
    ip: string;
    geoData?: {
      country?: string;
      city?: string;
      isp?: string;
    };
    userAgent?: string;
    isBot: boolean;
    botDetails?: BotDetection[];
  };
  requestInfo: {
    method: string;
    path: string;
    host: string;
    protocol: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
  };
  securityInfo?: {
    threats: SecurityThreat[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendation?: string;
  };
  authInfo?: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
  };
  performanceInfo?: {
    responseTime?: number;
    responseSize?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface SecurityDetectionResult {
  botDetections: BotDetection[];
  securityThreats: SecurityThreat[];
  authInfo?: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
  };
  metadata?: Record<string, unknown>;
}

export interface RequestContext {
  req: NextRequest;
  startTime: number;
  realIp: string;
  pathname: string;
  accessToken?: string;
  refreshToken?: string;
}
