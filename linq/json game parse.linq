<Query Kind="Statements">
  <Reference Relative="..\..\comorichweb linqpad\Newtonsoft.Json.dll">C:\Users\thinginab\Dropbox\comorichweb linqpad\Newtonsoft.Json.dll</Reference>
  <Reference Relative="..\..\comorichweb linqpad\LinqKit.dll">C:\Users\thinginab\Dropbox\comorichweb linqpad\LinqKit.dll</Reference>
  <Namespace>LinqKit</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
</Query>

var reader = new FileInfo(@"C:\Users\thinginab\Dropbox\wiffle\game data\Away at Home634638757954019725.json").OpenText();
var json = JObject.Parse(reader.ReadToEnd());
reader.Close();


//json.ToString(Newtonsoft.Json.Formatting.Indented).Dump();

var obj =  
	new
	{
		HomeTeam = new
		{
			Name = json["team1"].Value<string>("name"),
			Players = json["team1"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
		},
		AwayTeam = new
		{
			Name = json["team2"].Value<string>("name"),
			Players = json["team2"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
		},
		HalfInnings = (from hi in json["halfinnings"].Values<JObject>()
			select new
			{
				Number = hi.Value<int>("number"),
				Top = hi.Value<bool>("top"),
				TeamFielding = new
				{
					Name = hi["teamfielding"].Value<string>("name"),
					Players = hi["teamfielding"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
				},
				TeamBatting = new
				{
					Name = hi["teambatting"].Value<string>("name"),
					Players = hi["teambatting"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
				},
				AtBats = (from ab in hi["atbats"].Values<JObject>()
					select new
					{
						Pitcher = ab["pitcher"].Value<string>("name"),
						Batter = ab["batter"].Value<string>("name"),
						Outs = ab.Value<int>("currentOuts"),
						Pitches = ab["pitches"].Values<string>(),
						RunsScored = ab.Value<int>("runsScored"),
						Runners = (from b in ab["bases"].Values<JObject>()
							select new
							{
								number = b.Value<int>("number"),
								player = b["player"].ToString()
							}
						)
					}
				)
			}
		)
	};
/*
reader = new FileInfo(@"C:\Users\thinginab\Dropbox\wiffle\game data\GeoffLuke at JarrodAaron (fixed runners).json").OpenText();
json = JObject.Parse(reader.ReadToEnd());
reader.Close();


var obj2 =  
	new
	{
		HomeTeam = new
		{
			Name = json["team1"].Value<string>("name"),
			Players = json["team1"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
		},
		AwayTeam = new
		{
			Name = json["team2"].Value<string>("name"),
			Players = json["team2"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
		},
		HalfInnings = (from hi in json["halfinnings"].Values<JObject>()
			select new
			{
				Number = hi.Value<int>("number"),
				Top = hi.Value<bool>("top"),
				TeamFielding = new
				{
					Name = hi["teamfielding"].Value<string>("name"),
					Players = hi["teamfielding"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
				},
				TeamBatting = new
				{
					Name = hi["teambatting"].Value<string>("name"),
					Players = hi["teambatting"]["players"].Values<JObject>().Select(p=>p.Value<string>("name"))
				},
				AtBats = (from ab in hi["atbats"].Values<JObject>()
					select new
					{
						Pitcher = ab["pitcher"].Value<string>("name"),
						Batter = ab["batter"].Value<string>("name"),
						Outs = ab.Value<int>("currentOuts"),
						Pitches = ab["pitches"].Values<string>(),
						RunsScored = ab.Value<int>("runsScored"),
						Runners = (from b in ab["bases"].Values<JObject>()
							select new
							{
								number = b.Value<int>("number"),
								player = b["player"].ToString()
							}
						)
					}
				)
			}
		)
	};
	*/
//obj.Dump();
/*
for(int i=0; i<obj.HalfInnings.Count ( ); i++)
{
	obj.HalfInnings.Skip(i).First ( ).Dump();
	obj2.HalfInnings.Skip(i).First ( ).Dump();
}
*/

foreach(var hi in obj.HalfInnings)
{
//if(hi.TeamBatting.Name=="Away")
{
	hi.AtBats.Select(ab =>ab.Batter + ": "+String.Join(", ",ab.Pitches) ).Dump();
	//hi.Dump();
}
/*
	"------".Dump();
	foreach(var ab in hi.AtBats)
	{
		(ab.Batter+": "+ab.Pitches.Last ()).Dump();
	}
	*/
}
//obj.HalfInnings.First().Dump();