const os = require('os');

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

function sendMetricsPeriodically(period) {
        const timer = setInterval(() => {
          try {
            const buf = new MetricBuilder();
            httpMetrics(buf);
            systemMetrics(buf);
            userMetrics(buf);
            purchaseMetrics(buf);
            authMetrics(buf);
      
            const metrics = buf.toString('\n');
            this.sendMetricToGrafana(metrics);
          } catch (error) {
            console.log('Error sending metrics', error);
          }
        }, period);
      }

      function reportSystemMetrics() {
        setInterval(() => {
          const cpuUsage = getCpuUsagePercentage();
          const memoryUsage = getMemoryUsagePercentage();
          const metrics = `
            cpu_usage_percent ${cpuUsage}
            memory_usage_percent ${memoryUsage}
          `;
      
          sendMetricToGrafana(metrics);
        }, 10000);
      }
      

