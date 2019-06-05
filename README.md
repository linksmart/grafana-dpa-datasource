# Grafana Datasource Plugin for LinkSmart Data processing Agent

This is a [Grafana](https://grafana.com/) datasource plugin for [LinkSmart Data Processing Agent](https://docs.linksmart.eu/display/LA). It helps visualizing DPA statement results with [JSON Path](https://www.npmjs.com/package/JSONPath) query support to filter desired fields.

## Installation

Clone the project under Grafana plugin directory and restart Grafana:

```
cd /var/lib/grafana/plugins
git clone https://linksmart.eu/redmine/linksmart-opensource/linksmart-services/iot-data-processing-agent/grafana-dpa-plugin.git
sudo service grafana-server restart
```

## How to use

1. After installation click `Add data source` on Datasource page and give DPA Rest agent in `Http settings`. If the REST agent is accessible only internally or not in the same origin (see [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)), `Access` option should be set to `Proxy`.
2. In panel settings add metrics with DPA source.
3. Pick preferred Statement name in dropdown menu or give the ID directly.
4. It retrieves `lastOutput.Time` and `lastOutput.ResultValue` fields by default, if JSON Path field is left blank.
5. If Timestamp and Value pairs are series in the statement, use JSON Path queries to specify these fields:

For example for a statement like: `select window(*) from SenML(bn = ''dev1'').win:length(60)`,
`ResultValue` Object would be like:

```
"ResultValue":[  
   {  
      "bn":"dev1",
      "bt":1492685003,
      "e":[  
         {  
            "v":7089,
            "t":1492685003350
         }
      ]
   },
   {  
      "bn":"dev1",
      "bt":1492685004,
      "e":[  
         {  
            "v":14028,
            "t":1492685004361
         }
      ]
   },
   ...
]  
```

Now in order to filter `v` and `t` fields of the SenML object, `$[:].e[0].t` and `$[:].e[0].v` JSON Path values need to be used respectively.

## Development

This plugin requires node 6.10.0

```
npm install -g yarn
yarn install
npm run build
```

`scripts/message-publisher.sh` can be used for development or demo purpose
(make sure to have a running DPA instance and MQTT broker).

## License

Released under [Apache License, Version 2.0](LICENSE).
