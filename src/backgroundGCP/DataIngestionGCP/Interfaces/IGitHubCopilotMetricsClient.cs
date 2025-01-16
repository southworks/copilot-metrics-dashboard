using System.Threading.Tasks;
using Microsoft.CopilotDashboard.DataIngestion.Models;

namespace Microsoft.CopilotDashboard.DataIngestion.Interfaces
{
    public interface IGitHubCopilotMetricsClient
    {
        Task<Metrics[]> GetCopilotMetricsForEnterpriseAsync(string? team);
        Task<Metrics[]> GetCopilotMetricsForOrganizationAsync(string? team);
        ValueTask<Metrics[]> GetTestCoPilotMetrics(string? team);
    }
}