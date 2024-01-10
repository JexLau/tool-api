import { Injectable } from '@nestjs/common';
import * as net from 'net';
import wretch from 'wretch';

@Injectable()
export class WhoisService {
  async getWhoisAddress(suffix: string): Promise<string> {
    const url = `https://www.iana.org/whois?q=${suffix}`;
    const response = await wretch(url).get().text();
    return response;
  }

  intercept(originalString: string): string {
    const startCharacter = 'whois:';
    const endCharacter = 'status';
    const startPos = originalString.indexOf(startCharacter);
    const endPos = originalString.indexOf(endCharacter, startPos + 1);
    return originalString.substring(startPos + 6, endPos).trim();
  }

  async getDomainWhois(
    whoisServiceAddress: string,
    domain: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let whoisInformation = '';
      const client = net.createConnection(
        { host: whoisServiceAddress, port: 43 },
        () => {
          client.write(domain + '\r\n');
        },
      );

      client.on('data', (data) => {
        whoisInformation += data.toString();
      });

      client.on('end', () => {
        resolve(whoisInformation);
      });

      client.on('error', (err) => {
        reject(err);
      });
    });
  }

  formatWhois(whoisInformation: string): Record<string, string | string[]> {
    const formattedData: { [key: string]: string | string[] } = {};

    // Regular expressions for different fields
    const regexPatterns: { [key: string]: RegExp } = {
      domainName: /Domain Name: (.+?)\r\n/,
      registryDomainID: /Registry Domain ID: (.+?)\r\n/,
      registrarWHOISServer: /Registrar WHOIS Server: (.+?)\r\n/,
      registrarURL: /Registrar URL: (.+?)\r\n/,
      updatedDate: /Updated Date: (.+?)\r\n/,
      creationDate: /Creation Date: (.+?)\r\n/,
      registryExpiryDate: /Registry Expiry Date: (.+?)\r\n/,
      registrar: /Registrar: (.+?)\r\n/,
      registrarIANAID: /Registrar IANA ID: (.+?)\r\n/,
      registrarAbuseContactEmail: /Registrar Abuse Contact Email: (.+?)\r\n/,
      registrarAbuseContactPhone: /Registrar Abuse Contact Phone: (.+?)\r\n/,
      domainStatus: /Domain Status: (.+?)\r\n/g, // Multiple occurrences
      nameServer: /Name Server: (.+?)\r\n/g, // Multiple occurrences
      dnssec: /DNSSEC: (.+?)\r\n/,
    };

    // Extracting data using regular expressions
    for (const [key, regex] of Object.entries(regexPatterns)) {
      const match = whoisInformation.match(regex);
      if (match) {
        formattedData[key] = match.length > 1 ? match.slice(1) : match[1];
      }
    }

    return formattedData;
  }

  async query(domain: string): Promise<any> {
    const suffix = domain.split('.').pop();
    if (!suffix) {
      throw new Error('无法解析域名后缀');
    }

    const whoisData = await this.getWhoisAddress(suffix);
    const whoisServiceAddress = this.intercept(whoisData);

    const whoisInformation = await this.getDomainWhois(
      whoisServiceAddress,
      domain,
    );
    // 这里可以添加对 whoisInformation 的进一步处理逻辑
    const result = this.formatWhois(whoisInformation);
    return result;
  }
}
