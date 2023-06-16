namespace Tx
{
    public class Report
    {
        public Report()
        {
            //ErrorCase.Init();
        }

        public string Id { get; set; } = string.Empty;
        public string StoreId { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string WorkLog { get; set; } = string.Empty;
        public DateTime WorkDate { get; set; } = new();
        public WorkTime WorkTime { get; set; } = new();
        public ulong TimeStamp { get; set; } = 0;
        public string TicketLink { get; set; } = string.Empty;
        public ErrorCase ErrorCase { get; set; } = new();
    }

    public class ErrorCase : Dictionary<RepairType, Dictionary<ComponentType, bool>>
    {
        public bool this[(RepairType repair, ComponentType component) pair]
        {
            get
            {
                if (!this.ContainsKey(pair.repair))
                {
                    this.Add(pair.repair, new());
                }
                if (!this[pair.repair].ContainsKey(pair.component))
                {
                    this[pair.repair].Add(pair.component, false);
                }
                return this[pair.repair][pair.component];
            }
            set
            {
                if (!this.ContainsKey(pair.repair))
                {
                    this.Add(pair.repair, new());
                }
                if (!this[pair.repair].ContainsKey(pair.component))
                {
                    this[pair.repair].Add(pair.component, false);
                }
                this[pair.repair][pair.component] = value;
            }
        }

        public ErrorCase()
        {
            Init();
        }

        public void Init()
        {
            foreach (RepairType r in Enum.GetValues(typeof(RepairType)))
            {
                if (r == RepairType.None) { continue; }
                this[r] = new();
                foreach (ComponentType c in Enum.GetValues(typeof(ComponentType)))
                {
                    if (c == ComponentType.None) { continue; }
                    this[r][c] = false;
                }
            }
        }

        public void CleanFalse()
        {
            // get keys that its value is false
            List<(RepairType repair, ComponentType component)> list = new();
            foreach (RepairType r in Enum.GetValues(typeof(RepairType)))
            {
                if (!ContainsKey(r)) { continue; }
                foreach (ComponentType c in Enum.GetValues(typeof(ComponentType)))
                {
                    if (this[r].ContainsKey(c) && this[r][c] == false)
                    {
                        list.Add((r, c));
                    }
                }
            }

            // remove key
            foreach ((RepairType repair, ComponentType component) pair in list)
            {
                this[pair.repair].Remove(pair.component);
            }

            // remove if the parent dict key doesn't have any elements
            foreach (var kv in this.Where(x => x.Value.Count == 0))
            {
                Remove(kv.Key);
            }
        }
    }

    public enum ComponentType : int
    {
        None = 0,
        Head = 1,
        Arm = 2,
        Gripper = 3,
        BodyPillar = 4,
        Gantry = 5,
        Others = -1
    }
    public enum RepairType : int
    {
        None = 0,
        Adjustment = 1,
        RepairCable = 2,
        RepairActuator = 3,
        RepairBoard = 4,
        RepairAssy = 5,
        ReportOther = -1
    }

    public class WorkTime
    {
        public int Maintenance { get; set; } = 0;
        public int ToStore { get; set; } = 0;
        public int ToBack { get; set; } = 0;
        public int Other { get; set; } = 0;
        public bool IsValid()
        {
            return Maintenance > 0 && ToStore >= 0 && ToBack >= 0 && Other >= 0;
        }
        public int Total => Maintenance + ToStore + ToBack + Other;
    }

    public class Store
    {
        public string OpmStoreId { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;

    }
}