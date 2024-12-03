const config = require('./config.js');
const os = require('os');

class Metrics {
    constructor() {
        this.totalRequests = 0;
        this.methods = {
            GET: 0,
            POST: 0,
            DELETE: 0,
            PUT: 0,
        };
        this.pizzaData = {
            numSold: 0,
            totalRevenue: 0,
            latency: 0,
            creationFailures: 0,
        };
        this.authAttempts = {
            successful: 0,
            failed: 0,
        };
        this.activeUsers = 0;
        this.requestLatency = [];
    }

    sendMetricsPeriodically (rate) {
        this.intervalId = setInterval(() => {
            this.sendMetrics('osMetric', 'cpu_percentage', this.getCpuUsagePercentage());
            this.sendMetrics('osMetric', 'memory_percentage', this.getMemoryUsagePercentage());

            this.sendMetrics('pizzaMetric', 'pizza_sold', this.pizzaData.numSold);
            this.sendMetrics('pizzaMetric', 'pizza_revenue', this.pizzaData.totalRevenue);
            this.sendMetrics('pizzaMetric', 'pizza_latency', this.pizzaData.latency);
            this.sendMetrics('pizzaMetric', 'pizza_failures', this.pizzaData.creationFailures);

            this.sendMetrics('authMetric', 'auth_success', this.authAttempts.successful);
            this.sendMetrics('authMetric', 'auth_fail', this.authAttempts.failed);

            this.sendMetrics('userMetric', 'active_users', this.activeUsers);

            this.sendMetrics('httpMetric', 'all', this.totalRequests);
            this.sendMetrics('httpMetric', 'get', this.methods.GET);
            this.sendMetrics('httpMetric', 'post', this.methods.POST);
            this.sendMetrics('httpMetric', 'delete', this.methods.DELETE);
            this.sendMetrics('httpMetric', 'put', this.methods.PUT);
            this.sendMetrics('httpMetric', 'request_latency', this.average(this.requestLatency));
            this.requestLatency = [];
        }, rate).unref()
    }

    
    authSuccess() {
        this.authAttempts.successful++;
    }

    authFailure() {
        this.authAttempts.failed++;
    }

    addActiveUser() {
        this.activeUsers++;
    }

    removeActiveUser() {
        this.activeUsers--;
    }

    async incrementRequests(method) {
        this.totalRequests++;
        if (this.methods[method] !== undefined) {
            this.methods[method]++;
        }
    }

    updateRequestLatency(newLatency) {
        this.requestLatency.push(newLatency);
      }


    orderFailure() {
        this.pizzaData.creationFailures++
    }

    reportPrice(price) {
        this.pizzaData.totalRevenue += price
    }

    reportNumSold(numSold) {
        this.pizzaData.numSold += numSold
    }

    reportPizzaLatency(latency) {
        this.pizzaData.latency = latency;
    }

    getCpuUsagePercentage() {
        const cpuUsage = os.loadavg()[0] / os.cpus().length;
        return cpuUsage.toFixed(2) * 100;
    }

    average(array) {
        if (array.length == 0) {
          return null;
        }
        return array.reduce((a, b) => a + b) / array.length;
      }

    getMemoryUsagePercentage() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = (usedMemory / totalMemory) * 100;
        return memoryUsage.toFixed(2);
    }

    sendMetrics(metricPrefix, metricName, metricValue) {
        const metric = `${metricPrefix},source=${config.metrics.source} ${metricName}=${metricValue}`;

        fetch(`${config.metrics.url}`, {
            method: 'POST',
            body: metric,
            headers: {
                Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    console.error('Failed');
                }
            })
            .catch((error) => {
                console.error('Error pushing metric: ', error);
            });
    }
}

const metrics = new Metrics();
module.exports = metrics;