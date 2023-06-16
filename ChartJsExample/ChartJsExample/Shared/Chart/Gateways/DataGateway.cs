using System.Net.Http.Json;

namespace Tx
{
    public interface IDataGateway
    {
        Task<Report[]> LoadReports();
    }
    public class DataGateway : IDataGateway
    {
        HttpClient Http { get; set; }

        public DataGateway(HttpClient http)
        {
            Http = http;
        }

        public async Task<Report[]> LoadReports()
        {
            var reportJson = await Http.GetFromJsonAsync<Report[]>("sample-data/reports.json");
            return reportJson ?? Array.Empty<Report>();
        }
    }
}