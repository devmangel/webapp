import { NextRequest } from 'next/server';
import { SecurityThreat } from '../types/security';

const pathPatterns = [
  { regex: /\/(wp-admin|wp-login|wp-content|wordpress)/i, type: 'path' as const, subType: 'wordpress', severity: 'medium' as const, description: 'Intento de acceso a WordPress' },
  { regex: /\/(phpMyAdmin|myadmin|mysql|dbadmin|pma)/i, type: 'path' as const, subType: 'database', severity: 'high' as const, description: 'Intento de acceso a administrador de base de datos' },
  { regex: /\/(_ignition|\.env|config\.php|config\.json|settings\.php)/i, type: 'path' as const, subType: 'config', severity: 'high' as const, description: 'Intento de acceso a archivos de configuración' },
  { regex: /\/(\.git|\.svn|\.hg|\.DS_Store)/i, type: 'path' as const, subType: 'vcs', severity: 'medium' as const, description: 'Intento de acceso a repositorio de control de versiones' },
  { regex: /\/(shell|backdoor|c99|r57|webshell|cmd|eval)/i, type: 'path' as const, subType: 'shell', severity: 'critical' as const, description: 'Intento de acceso a shell o backdoor' },
  { regex: /\.(aspx|ashx|asmx|axd|asp)$/i, type: 'path' as const, subType: 'asp', severity: 'medium' as const, description: 'Búsqueda de endpoints ASP/ASP.NET' },
  { regex: /\.(php|phtml|php5|php7|phps)$/i, type: 'path' as const, subType: 'php', severity: 'medium' as const, description: 'Búsqueda de endpoints PHP' },
  { regex: /\/(actuator|metrics|health|info|trace|env)/i, type: 'path' as const, subType: 'spring', severity: 'high' as const, description: 'Reconocimiento de Spring Boot Actuator' },
  { regex: /\/api\/(v\d+\/)?(user|admin|config|token|auth|login)/i, type: 'path' as const, subType: 'api', severity: 'medium' as const, description: 'Reconocimiento de API sensible' },
];

// Headers sospechosos (removido x-forwarded-host ya que es legítimo con Nginx)
const suspiciousHeaders = [
  { name: 'x-originating-ip', severity: 'medium' as const },
  { name: 'x-remote-addr', severity: 'medium' as const },
  { name: 'x-remote-ip', severity: 'medium' as const },
  { name: 'x-client-ip', severity: 'medium' as const },
];

const suspiciousMethods = ['PUT', 'DELETE', 'TRACE', 'CONNECT'];

// Función para validar x-forwarded-host en contexto de Nginx reverse proxy
function validateForwardedHost(forwardedHost: string, originalHost: string): {
  isLegitimate: boolean;
  severity?: 'medium' | 'high';
  reason: string;
} {
  // Dominios legítimos de la configuración Nginx
  const legitimateDomains = [
    'productos-ai.com',
    'www.productos-ai.com'
  ];
  
  // Patrón para subdominios legítimos (*.productos-ai.com)
  const wildcardPattern = /^[\w-]+\.productos-ai\.com$/;
  
  // IPs legítimas (AWS, localhost, desarrollo)
  const legitimateIPs = /^(35\.168\.253\.122|127\.0\.0\.1|localhost|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/;
  
  // Caso 1: Dominios principales legítimos
  if (legitimateDomains.includes(forwardedHost)) {
    return {
      isLegitimate: true,
      reason: 'Dominio principal legítimo'
    };
  }
  
  // Caso 2: Subdominios legítimos
  if (wildcardPattern.test(forwardedHost)) {
    return {
      isLegitimate: true,
      reason: 'Subdominio legítimo de productos-ai.com'
    };
  }
  
  // Caso 3: IPs legítimas (AWS, desarrollo)
  if (legitimateIPs.test(forwardedHost)) {
    return {
      isLegitimate: true,
      reason: 'IP legítima (AWS/desarrollo)'
    };
  }
  
  // Caso 4: Coincide exactamente con el host original (configuración correcta de proxy)
  if (forwardedHost === originalHost) {
    return {
      isLegitimate: true,
      reason: 'Coincide con host original'
    };
  }
  
  // Caso 5: Dominios similares sospechosos (typosquatting)
  const suspiciousPatterns = [
    /productos-ai\.(net|org|info|biz)/i,
    /productos-ia\.com/i,
    /producto-ai\.com/i,
    /productosai\.(net|org|com)/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(forwardedHost)) {
      return {
        isLegitimate: false,
        severity: 'high',
        reason: 'Posible typosquatting o domain spoofing'
      };
    }
  }
  
  // Caso 6: Patrones de inyección
  const injectionPatterns = [
    /<script|javascript:|data:|vbscript:/i,
    /['"<>&;]/,
    /\.\.|\/\//
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(forwardedHost)) {
      return {
        isLegitimate: false,
        severity: 'high',
        reason: 'Posible inyección en header'
      };
    }
  }
  
  // Caso 7: Otros casos sospechosos
  return {
    isLegitimate: false,
    severity: 'medium',
    reason: 'Host no reconocido en configuración de proxy'
  };
}

export function detectSecurityThreats(req: NextRequest): SecurityThreat[] {
  const threats: SecurityThreat[] = [];
  const path = req.nextUrl.pathname;
  const method = req.method;
  const userAgent = req.headers.get('user-agent') || '';
  const referer = req.headers.get('referer') || '';
  const host = req.headers.get('host') || '';
  
  // Evaluar patrones de ruta
  for (const pattern of pathPatterns) {
    if (pattern.regex.test(path)) {
      threats.push({
        type: pattern.type,
        subType: pattern.subType,
        severity: pattern.severity,
        description: pattern.description,
        evidence: path,
        suggestedAction: 'Monitorear IP si persisten los intentos'
      });
    }
  }
  
  // Métodos HTTP sospechosos
  if (suspiciousMethods.includes(method)) {
    threats.push({
      type: 'method',
      subType: method.toLowerCase(),
      severity: 'medium',
      description: `Método HTTP potencialmente peligroso: ${method}`,
      evidence: method,
      suggestedAction: 'Verificar si el método está permitido para esta ruta'
    });
  }
  
  // Headers sospechosos (excluyendo x-forwarded-host)
  for (const header of suspiciousHeaders) {
    if (req.headers.get(header.name)) {
      threats.push({
        type: 'header',
        subType: header.name,
        severity: header.severity,
        description: `Header de manipulación de IP detectado: ${header.name}`,
        evidence: `${header.name}: ${req.headers.get(header.name)}`,
        suggestedAction: 'Verificar si es un proxy legítimo'
      });
    }
  }
  
  // Validación específica para x-forwarded-host (contexto de Nginx)
  const forwardedHost = req.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const validation = validateForwardedHost(forwardedHost, host);
    
    if (!validation.isLegitimate) {
      threats.push({
        type: 'header',
        subType: 'x-forwarded-host-suspicious',
        severity: validation.severity!,
        description: `Header x-forwarded-host sospechoso: ${validation.reason}`,
        evidence: `x-forwarded-host: ${forwardedHost}`,
        suggestedAction: validation.severity === 'high' ? 
          'Bloquear IP si persiste' : 
          'Monitorear y verificar configuración de proxy'
      });
    }
  }
  
  // Detección de anomalías
  if (referer && !/^https?:\/\/([^/]+\.)?productos-ai\.com/.test(referer)) {
    if (path.includes('/dashboard/') || path.includes('/admin/') || path.includes('/api/')) {
      threats.push({
        type: 'anomaly',
        subType: 'external_referer',
        severity: 'medium',
        description: 'Referer externo accediendo a ruta protegida',
        evidence: `Referer: ${referer}, Path: ${path}`,
        suggestedAction: 'Verificar cross-site request forgery'
      });
    }
  }
  
  // Path Traversal
  if (/\.\.\/|\.\.\\/i.test(path) || /\/\.\.\/|\/\.\.\//i.test(path)) {
    threats.push({
      type: 'path',
      subType: 'traversal',
      severity: 'critical',
      description: 'Intento de path traversal detectado',
      evidence: path,
      suggestedAction: 'Bloquear IP inmediatamente'
    });
  }
  
  // Sistema de puntuación de riesgo
  let riskScore = 0;
  if (path.includes('/wp-') || path.includes('_ignition')) riskScore += 20;
  if (suspiciousMethods.includes(method)) riskScore += 15;
  if (!userAgent) riskScore += 25;
  if (/select|union|drop|exec|eval/i.test(path)) riskScore += 30;
  
  if (riskScore >= 40) {
    threats.push({
      type: 'anomaly',
      subType: 'high_risk_behavior',
      severity: 'high',
      description: `Comportamiento de alto riesgo detectado (puntuación: ${riskScore})`,
      evidence: `Método: ${method}, Path: ${path}${userAgent ? ', User-Agent: ' + userAgent : ''}`,
      suggestedAction: 'Monitorear de cerca o bloquear temporalmente según políticas'
    });
  }
  
  return threats;
}
