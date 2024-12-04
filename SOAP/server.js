const http = require('http');
const soap = require('strong-soap').soap;

// Define el servicio SOAP
const service = {
  MathService: {
    MathServicePort: {
      Add: function (args) {
        // Asegurarse de que los parámetros A y B sean números
        const result = args.A + args.B;
        return {
          result: result
        };
      }
    }
  }
};

// Define el WSDL del servicio SOAP
const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions name="MathService"
  targetNamespace="http://www.example.com/math"
  xmlns:tns="http://www.example.com/math"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"
  xmlns="http://schemas.xmlsoap.org/wsdl/">

  <message name="AddRequest">
    <part name="A" type="xsd:int"/>
    <part name="B" type="xsd:int"/>
  </message>

  <message name="AddResponse">
    <part name="result" type="xsd:int"/>
  </message>

  <portType name="MathServicePortType">
    <operation name="Add">
      <input message="tns:AddRequest"/>
      <output message="tns:AddResponse"/>
    </operation>
  </portType>

  <binding name="MathServiceBinding" type="tns:MathServicePortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="Add">
      <soap:operation soapAction="http://www.example.com/math/Add"/>
      <input>
        <soap:body use="encoded" namespace="http://www.example.com/math" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
      </input>
      <output>
        <soap:body use="encoded" namespace="http://www.example.com/math" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
      </output>
    </operation>
  </binding>

  <service name="MathService">
    <port name="MathServicePort" binding="tns:MathServiceBinding">
      <soap:address location="http://localhost:8000/soap"/>
    </port>
  </service>
</definitions>`;

const server = http.createServer((req, res) => {
  res.end("404: Not Found");
});

server.listen(8000, () => {
  console.log("Servidor SOAP escuchando en http://localhost:8000/soap");
});

soap.listen(server, '/soap', service, wsdl);