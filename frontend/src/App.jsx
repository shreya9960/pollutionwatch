import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = "/api";

// const INDIA_DATA = {
//   "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Tirupati","Kurnool","Rajahmundry","Kakinada","Nellore","Kadapa","Anantapur","Ongole","Eluru","Machilipatnam","Srikakulam","Vizianagaram"],
//   "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Ziro","Bomdila","Tawang","Along","Tezu","Roing","Khonsa"],
//   "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon","Dhubri","Karimganj","Sivasagar","Goalpara","North Lakhimpur","Diphu","Haflong"],
//   "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Bihar Sharif","Arrah","Begusarai","Katihar","Munger","Chhapra","Saharsa","Hajipur","Buxar"],
//   "Chhattisgarh": ["Raipur","Bhilai","Durg","Bilaspur","Korba","Rajnandgaon","Jagdalpur","Raigarh","Ambikapur","Dhamtari","Chirmiri","Mahasamund","Kondagaon","Kanker","Kawardha"],
//   "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Sanquelim","Curchorem","Quepem","Mormugao"],
//   "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Navsari","Morbi","Nadiad","Surendranagar","Bharuch","Mehsana"],
//   "Haryana": ["Faridabad","Gurgaon","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat","Panchkula","Bhiwani","Sirsa","Bahadurgarh","Jind","Thanesar"],
//   "Himachal Pradesh": ["Shimla","Mandi","Solan","Dharamshala","Baddi","Palampur","Nahan","Sundernagar","Chamba","Una","Hamirpur","Bilaspur","Kullu","Manali","Kangra"],
//   "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih","Ramgarh","Medininagar","Chakradharpur","Dumka","Chaibasa","Lohardaga","Gumla","Simdega"],
//   "Karnataka": ["Bangalore","Mysore","Hubli","Mangalore","Belgaum","Gulbarga","Davanagere","Bellary","Bijapur","Shimoga","Tumkur","Raichur","Bidar","Dharwad","Udupi"],
//   "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Kannur","Alappuzha","Palakkad","Malappuram","Kottayam","Kasaragod","Pathanamthitta","Wayanad","Idukki","Ernakulam"],
//   "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Dewas","Satna","Ratlam","Rewa","Singrauli","Burhanpur","Khandwa","Bhind","Morena"],
//   "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Amravati","Kolhapur","Sangli","Malegaon","Jalgaon","Akola","Latur","Dhule","Ahmednagar"],
//   "Manipur": ["Imphal","Thoubal","Kakching","Churachandpur","Senapati","Ukhrul","Chandel","Tamenglong","Bishnupur","Jiribam"],
//   "Meghalaya": ["Shillong","Tura","Jowai","Nongstoin","Williamnagar","Baghmara","Resubelpara","Mairang","Nongpoh","Cherrapunjee"],
//   "Mizoram": ["Aizawl","Lunglei","Saiha","Champhai","Kolasib","Serchhip","Lawngtlai","Mamit","Khawzawl","Hnahthial"],
//   "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Phek","Mon","Longleng","Kiphire"],
//   "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Brahmapur","Sambalpur","Puri","Balasore","Bhadrak","Baripada","Jharsuguda","Jeypore","Barbil","Kendujhar","Paradip","Rayagada"],
//   "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Firozpur","Batala","Pathankot","Hoshiarpur","Moga","Abohar","Malerkotla","Khanna","Phagwara"],
//   "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar","Pali","Sri Ganganagar","Tonk","Banswara","Churu"],
//   "Sikkim": ["Gangtok","Namchi","Mangan","Gyalshing","Rangpo","Jorethang","Nayabazar","Singtam","Yuksom","Pelling"],
//   "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Tiruppur","Vellore","Erode","Thoothukkudi","Dindigul","Thanjavur","Sivakasi","Karur","Ranipet"],
//   "Telangana": ["Hyderabad","Warangal","Nizamabad","Khammam","Karimnagar","Ramagundam","Mahbubnagar","Nalgonda","Adilabad","Suryapet","Miryalaguda","Siddipet","Bodhan","Mancherial","Jagtial"],
//   "Tripura": ["Agartala","Udaipur","Dharmanagar","Kailasahar","Belonia","Khowai","Ambassa","Sabroom","Sonamura","Melaghar"],
//   "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Bareilly","Aligarh","Moradabad","Saharanpur","Gorakhpur","Noida","Firozabad","Jhansi","Mathura"],
//   "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh","Kotdwar","Ramnagar","Nainital","Mussoorie","Pithoragarh","Almora","Champawat","Lansdowne"],
//   "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Bardhaman","Malda","Baharampur","Habra","Kharagpur","Shantipur","Dankuni","Dhulian","Ranaghat","Haldia"],
//   "Delhi": ["New Delhi","Central Delhi","North Delhi","South Delhi","East Delhi","West Delhi","North East Delhi","North West Delhi","South East Delhi","South West Delhi"],
//   "Jammu & Kashmir": ["Srinagar","Jammu","Anantnag","Sopore","Baramulla","Kathua","Udhampur","Punch","Rajouri","Leh"],
//   "Ladakh": ["Leh","Kargil","Nubra","Drass","Zanskar","Diskit","Padum","Turtuk","Nyoma","Khaltsi"],
//   "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam","Ozhukarai","Villianur","Ariyankuppam","Nettapakkam"],
//   "Chandigarh": ["Chandigarh"],
//   "Andaman & Nicobar": ["Port Blair","Diglipur","Rangat","Mayabunder","Car Nicobar","Little Andaman"],
//   "Dadra & Nagar Haveli": ["Silvassa","Amli","Dadra","Naroli"],
//   "Daman & Diu": ["Daman","Diu","Moti Daman","Nani Daman"],
//   "Lakshadweep": ["Kavaratti","Agatti","Amini","Andrott","Minicoy"]
// };
const INDIA_DATA = {
  "Andhra Pradesh": [
    "Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Nellore","Prakasam",
    "Srikakulam","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"
  ],

  "Arunachal Pradesh": [
    "Anjaw","Changlang","Dibang Valley","East Kameng","East Siang","Kamle","Kra Daadi",
    "Kurung Kumey","Lepa Rada","Lohit","Longding","Lower Dibang Valley","Lower Siang",
    "Lower Subansiri","Namsai","Pakke Kessang","Papum Pare","Shi Yomi","Siang","Tawang",
    "Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"
  ],

  "Assam": [
    "Bajali","Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang",
    "Darrang","Dhemaji","Dhubri","Dibrugarh","Dima Hasao","Goalpara","Golaghat",
    "Hailakandi","Hojai","Jorhat","Kamrup","Kamrup Metropolitan","Karbi Anglong",
    "Karimganj","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari",
    "Sivasagar","Sonitpur","South Salmara-Mankachar","Tinsukia","Udalguri",
    "West Karbi Anglong"
  ],

  "Bihar": [
    "Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar",
    "Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur",
    "Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger",
    "Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur",
    "Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali",
    "West Champaran"
  ],

  "Chhattisgarh": [
    "Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur",
    "Dantewada","Dhamtari","Durg","Gariaband","Gaurela-Pendra-Marwahi","Janjgir-Champa",
    "Jashpur","Kabirdham","Kanker","Khairagarh","Kondagaon","Korba","Koriya",
    "Mahasamund","Manendragarh","Mohla-Manpur","Mungeli","Narayanpur","Raigarh",
    "Raipur","Rajnandgaon","Sakti","Sarangarh-Bilaigarh","Sukma","Surajpur","Surguja"
  ],

  "Goa": ["North Goa","South Goa"],

  "Gujarat": [
    "Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad",
    "Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath",
    "Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada",
    "Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat",
    "Surendranagar","Tapi","Vadodara","Valsad"
  ],

  "Haryana": [
    "Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar",
    "Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal",
    "Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"
  ],

  "Himachal Pradesh": [
    "Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti",
    "Mandi","Shimla","Sirmaur","Solan","Una"
  ],

  "Jharkhand": [
    "Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih",
    "Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga",
    "Pakur","Palamu","Ramgarh","Ranchi","Sahebganj","Seraikela Kharsawan","Simdega",
    "West Singhbhum"
  ],

  "Karnataka": [
    "Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar",
    "Chamarajanagar","Chikballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada",
    "Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar",
    "Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru",
    "Udupi","Uttara Kannada","Vijayapura","Yadgir"
  ],

  "Kerala": [
    "Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam",
    "Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram",
    "Thrissur","Wayanad"
  ],

  "Madhya Pradesh": [
    "Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul",
    "Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas",
    "Dhar","Dindori","Guna","Gwalior","Harda","Indore","Jabalpur","Jhabua","Katni",
    "Khandwa","Khargone","Mandla","Mandsaur","Morena","Narmadapuram","Narsinghpur",
    "Neemuch","Niwari","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna",
    "Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli",
    "Tikamgarh","Ujjain","Umaria","Vidisha"
  ],

  "Maharashtra": [
    "Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana",
    "Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur",
    "Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik",
    "Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara",
    "Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"
  ],

  "Manipur": [
    "Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam",
    "Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong",
    "Tengnoupal","Thoubal","Ukhrul"
  ],

  "Meghalaya": [
    "East Garo Hills","East Jaintia Hills","East Khasi Hills","North Garo Hills",
    "Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills",
    "West Garo Hills","West Jaintia Hills","West Khasi Hills"
  ],

  "Mizoram": [
    "Aizawl","Champhai","Hnahthial","Khawzawl","Kolasib","Lawngtlai","Lunglei",
    "Mamit","Saiha","Saitual","Serchhip"
  ],

  "Nagaland": [
    "Chümoukedima","Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon",
    "Niuland","Noklak","Peren","Phek","Shamator","Tseminyu","Tuensang","Wokha","Zunheboto"
  ],

  "Odisha": [
    "Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh",
    "Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi",
    "Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj",
    "Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur",
    "Sundargarh"
  ],

  "Punjab": [
    "Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur",
    "Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Malerkotla","Mansa",
    "Moga","Mohali","Muktsar","Pathankot","Patiala","Rupnagar","Sangrur","Shaheed Bhagat Singh Nagar","Tarn Taran"
  ],

  "Rajasthan": [
    "Ajmer","Alwar","Anupgarh","Balotra","Banswara","Baran","Barmer","Beawar","Bharatpur",
    "Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Deeg","Dholpur","Didwana-Kuchaman",
    "Dudu","Dungarpur","Gangapur City","Hanumangarh","Jaipur","Jaipur Rural","Jaisalmer",
    "Jalore","Jhalawar","Jhunjhunu","Jodhpur","Jodhpur Rural","Karauli","Kekri","Khairthal-Tijara",
    "Kota","Kotputli-Behror","Nagaur","Neem Ka Thana","Pali","Phalodi","Pratapgarh",
    "Rajsamand","Salumbar","Sanchore","Sawai Madhopur","Shahpura","Sikar","Sirohi",
    "Sri Ganganagar","Tonk","Udaipur"
  ]
};

const AQI_LEVELS = [
  { max: 50,  label: "Good",                         color: "#16a34a", bg: "#dcfce7" },
  { max: 100, label: "Moderate",                     color: "#ca8a04", bg: "#fef9c3" },
  { max: 150, label: "Unhealthy for Sensitive Groups", color: "#ea580c", bg: "#ffedd5" },
  { max: 200, label: "Unhealthy",                    color: "#dc2626", bg: "#fee2e2" },
  { max: 300, label: "Very Unhealthy",               color: "#7c3aed", bg: "#ede9fe" },
  { max: 500, label: "Hazardous",                    color: "#9f1239", bg: "#ffe4e6" },
];

function getAqiLevel(aqi) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:48 }}>
      <div style={{ width:44, height:44, border:"4px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", ...style }}>
      {children}
    </div>
  );
}

function Section({ title, children, style }) {
  return (
    <Card style={{ marginBottom:24, ...style }}>
      {title && <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:700, color:"#1e293b", display:"flex", alignItems:"center", gap:8 }}>{title}</h3>}
      {children}
    </Card>
  );
}

function Badge({ color, bg, children }) {
  return (
    <span style={{ background:bg, color, fontWeight:700, padding:"3px 12px", borderRadius:20, fontSize:13, border:`1px solid ${color}33` }}>
      {children}
    </span>
  );
}

function PBar({ label, value, max, unit, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:13, fontWeight:600, color:"#475569" }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:700, color }}>{value} <span style={{ fontWeight:400, color:"#94a3b8" }}>{unit}</span></span>
      </div>
      <div style={{ background:"#f1f5f9", borderRadius:8, height:9 }}>
        <div style={{ width:`${pct}%`, background:color, height:"100%", borderRadius:8, transition:"width 0.6s" }} />
      </div>
    </div>
  );
}

function StatBox({ emoji, label, value, unit, color }) {
  return (
    <div style={{ background:"#f8fafc", borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, flex:1, minWidth:140 }}>
      <span style={{ fontSize:28 }}>{emoji}</span>
      <div>
        <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:800, color:color||"#1e293b", lineHeight:1.2 }}>
          {value}<span style={{ fontSize:12, fontWeight:400, marginLeft:3 }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dropdowns ────────────────────────────────────────────────────────────────
function StateCitySelect({ onSearch, loading, cityLabel = "City" }) {
  const [state, setState] = useState("");
  const [city, setCity]   = useState("");
  const states = Object.keys(INDIA_DATA).sort();

  const sel = { padding:"10px 14px", borderRadius:10, border:"2px solid #e2e8f0", fontSize:14, background:"#f8fafc", minWidth:190 };

  return (
    <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
      {[
        { lbl:"State", val:state, opts:states, onChange:v=>{setState(v);setCity("");}, disabled:false },
        { lbl:cityLabel, val:city, opts:state?INDIA_DATA[state]:[], onChange:v=>setCity(v), disabled:!state },
      ].map(({lbl,val,opts,onChange,disabled})=>(
        <div key={lbl}>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:1 }}>{lbl}</div>
          <select value={val} onChange={e=>onChange(e.target.value)} disabled={disabled} style={{...sel, opacity:disabled?0.5:1}}>
            <option value="">Select {lbl}</option>
            {opts.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <button
        onClick={()=>city&&state&&onSearch(state,city)}
        disabled={!city||!state||loading}
        style={{ padding:"10px 28px", borderRadius:10, border:"none", fontWeight:700, fontSize:14, cursor:city&&state&&!loading?"pointer":"not-allowed",
          background:city&&state&&!loading?"linear-gradient(135deg,#6366f1,#3b82f6)":"#e2e8f0",
          color:city&&state&&!loading?"#fff":"#94a3b8", transition:"all 0.2s" }}>
        {loading?"Searching…":"Search →"}
      </button>
    </div>
  );
}

// ─── Leaflet Map ──────────────────────────────────────────────────────────────
function LeafMap({ center, points }) {
  const ref = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    if (!center || inst.current) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      if (!ref.current || inst.current) return;
      const L = window.L;
      const map = L.map(ref.current).setView([center.lat, center.lon], 10);
      inst.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:"© OpenStreetMap"
      }).addTo(map);
      (points||[]).forEach(p => {
        const lvl = getAqiLevel(p.aqi||100);
        L.circleMarker([p.lat,p.lon], { radius:16, fillColor:lvl.color, color:"#fff", weight:2, fillOpacity:0.82 })
          .bindPopup(`<b>${p.name||"Zone"}</b><br>AQI: <b>${p.aqi}</b><br>${lvl.label}`)
          .addTo(map);
      });
    };
    document.head.appendChild(script);
    return () => { if (inst.current) { inst.current.remove(); inst.current = null; } };
  }, [center, points]);

  return <div ref={ref} style={{ height:360, borderRadius:12, border:"2px solid #e2e8f0", overflow:"hidden" }} />;
}

// ─── Citizen Report ───────────────────────────────────────────────────────────
function ReportForm({ type, city, state }) {
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!desc.trim()) return;
    setBusy(true);
    try {
      await fetch(`${API_BASE}/reports/citizen`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ pollution_type:type, city, state, description:desc, photo_base64:photo })
      });
      setDone(true);
    } catch(e){}
    setBusy(false);
  }

  if (done) return (
    <div style={{ textAlign:"center", padding:28 }}>
      <div style={{ fontSize:44, marginBottom:8 }}>✅</div>
      <div style={{ fontWeight:700, color:"#16a34a", fontSize:16 }}>Report submitted! Thank you.</div>
    </div>
  );

  return (
    <div>
      <p style={{ margin:"0 0 10px", fontSize:13, color:"#64748b" }}>📍 Auto-location: <b>{city}, {state}</b></p>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)}
        placeholder="Describe what you observed — smell, colour, visible waste, impact on wildlife…"
        style={{ width:"100%", minHeight:90, padding:12, borderRadius:10, border:"2px solid #e2e8f0", fontSize:14, resize:"vertical", boxSizing:"border-box", fontFamily:"inherit" }} />
      <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
        <label style={{ padding:"8px 16px", borderRadius:8, border:"2px dashed #cbd5e1", cursor:"pointer", fontSize:13, color:"#475569", display:"flex", alignItems:"center", gap:6 }}>
          📎 {photo ? "Attached ✓" : "Attach Photo/Video"}
          <input type="file" accept="image/*,video/*" style={{ display:"none" }} onChange={e=>{
            const f=e.target.files[0]; if(!f)return;
            const r=new FileReader(); r.onload=ev=>setPhoto(ev.target.result.split(",")[1]); r.readAsDataURL(f);
          }} />
        </label>
        <button onClick={submit} disabled={!desc.trim()||busy}
          style={{ padding:"8px 24px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6366f1,#3b82f6)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {busy?"Submitting…":"Submit Report"}
        </button>
      </div>
    </div>
  );
}

// ─── Community Feed ───────────────────────────────────────────────────────────
function Feed({ type }) {
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState({});
  const [inp, setInp] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/reports/citizen?pollution_type=${type}`).then(r=>r.json()).then(setReports).catch(()=>{});
  }, [type]);

  async function loadComments(id) {
    const d = await fetch(`${API_BASE}/reports/comments?report_id=${id}`).then(r=>r.json());
    setComments(p=>({...p,[id]:d}));
  }
  async function addComment(id) {
    const text=inp[id]; if(!text?.trim())return;
    await fetch(`${API_BASE}/reports/comment`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({report_id:id,text})});
    setInp(p=>({...p,[id]:""}));
    loadComments(id);
  }

  if (!reports.length) return <p style={{ color:"#94a3b8", fontSize:14 }}>No community reports yet for this area.</p>;

  return (
    <div style={{ maxHeight:380, overflowY:"auto" }}>
      {reports.map((r,i)=>(
        <div key={r.id} style={{ paddingBottom:16, marginBottom:16, borderBottom:i<reports.length-1?"1px solid #f1f5f9":"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontWeight:700, fontSize:14 }}>📍 {r.city}, {r.state}</span>
            <span style={{ fontSize:12, color:"#94a3b8" }}>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
          </div>
          <p style={{ margin:"0 0 8px", fontSize:14, color:"#475569" }}>{r.description}</p>
          {r.photo_url && <img src={`data:image/jpeg;base64,${r.photo_url}`} alt="" style={{ maxWidth:180, borderRadius:8, marginBottom:8 }} />}
          <button onClick={()=>loadComments(r.id)} style={{ fontSize:12, color:"#6366f1", background:"none", border:"none", cursor:"pointer", padding:0 }}>
            💬 {comments[r.id] ? `${comments[r.id].length} comments` : "View comments"}
          </button>
          {comments[r.id] && (
            <div style={{ marginTop:8, paddingLeft:14, borderLeft:"3px solid #e2e8f0" }}>
              {comments[r.id].map(c=>(
                <div key={c.id} style={{ fontSize:13, color:"#475569", marginBottom:4 }}>• {c.text}</div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <input value={inp[r.id]||""} onChange={e=>setInp(p=>({...p,[r.id]:e.target.value}))}
                  placeholder="Add a comment…"
                  style={{ flex:1, padding:"6px 10px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13 }}
                  onKeyDown={e=>e.key==="Enter"&&addComment(r.id)} />
                <button onClick={()=>addComment(r.id)} style={{ padding:"6px 14px", borderRadius:8, background:"#6366f1", color:"#fff", border:"none", fontSize:13, cursor:"pointer" }}>Post</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Alert Ticker ─────────────────────────────────────────────────────────────
function Ticker() {
  const [alerts, setAlerts] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(()=>{
    fetch(`${API_BASE}/alerts`).then(r=>r.json()).then(setAlerts).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!alerts.length) return;
    const t=setInterval(()=>setIdx(i=>(i+1)%alerts.length),4000);
    return ()=>clearInterval(t);
  },[alerts]);

  if(!alerts.length) return null;
  const a = alerts[idx];

  return (
    <div style={{ background:"linear-gradient(90deg,#0f172a,#1e3a5f)", padding:"9px 24px", display:"flex", alignItems:"center", gap:14, minHeight:38 }}>
      <span style={{ background:"#ef4444", color:"#fff", borderRadius:5, padding:"1px 10px", fontSize:11, fontWeight:800, whiteSpace:"nowrap", letterSpacing:1 }}>● LIVE</span>
      <div style={{ flex:1, color:"#e2e8f0", fontSize:13, fontWeight:500, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }} key={idx}>
        <b>{a.city}</b> · {a.temp}°C · {a.description} · AQI {a.aqi} · 💨 {a.wind} m/s · 💧 {a.humidity}%
      </div>
      <div style={{ display:"flex", gap:5 }}>
        {alerts.map((_,i)=>(
          <div key={i} onClick={()=>setIdx(i)} style={{ width:7, height:7, borderRadius:"50%", background:i===idx?"#818cf8":"#334155", cursor:"pointer" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, user, onAuthClick, onLogout }) {
  const tabs = [
    { id:"landing", label:"🏠 Home" },
    { id:"air",     label:"💨 Air Quality" },
    { id:"water",   label:"💧 Water Quality" },
    { id:"soil",    label:"🌱 Soil Health" },
  ];

  return (
    <nav style={{ background:"rgba(15,23,42,0.97)", backdropFilter:"blur(12px)", padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:1000, boxShadow:"0 2px 20px rgba(0,0,0,0.25)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:26 }}>🌍</span>
        <span style={{ color:"#fff", fontWeight:900, fontSize:19, letterSpacing:-0.5 }}>PollutionWatch</span>
        <span style={{ color:"#475569", fontSize:11, marginLeft:4 }}>India</span>
      </div>
      <div style={{ display:"flex", gap:2 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setPage(t.id)}
            style={{ padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:page===t.id?700:500,
              background:page===t.id?"rgba(99,102,241,0.85)":"transparent",
              color:page===t.id?"#fff":"#94a3b8", transition:"all 0.18s" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {user
          ? <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>👤 {user.username}</span>
              <button onClick={onLogout} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #374151", background:"transparent", color:"#94a3b8", fontSize:12, cursor:"pointer" }}>Logout</button>
            </div>
          : <button onClick={onAuthClick} style={{ padding:"7px 18px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6366f1,#3b82f6)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Sign In
            </button>
        }
      </div>
    </nav>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username:"", email:"", password:"" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, border:"2px solid #e2e8f0", fontSize:14, marginBottom:10, boxSizing:"border-box", fontFamily:"inherit" };

  async function go() {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`${API_BASE}/auth/${mode}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail||"Error");
      onLogin(d); onClose();
    } catch(e){ setErr(e.message); }
    setBusy(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:40, width:360, boxShadow:"0 24px 64px rgba(0,0,0,0.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{mode==="login"?"Sign In":"Create Account"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#94a3b8", lineHeight:1 }}>×</button>
        </div>
        {mode==="signup" && <input placeholder="Username" style={inp} value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} />}
        <input placeholder="Email" type="email" style={inp} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} />
        <input placeholder="Password" type="password" style={inp} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()} />
        {err && <p style={{ color:"#ef4444", fontSize:13, margin:"0 0 10px" }}>{err}</p>}
        <button onClick={go} disabled={busy} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:"linear-gradient(135deg,#6366f1,#3b82f6)", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>
          {busy?"…":mode==="login"?"Sign In":"Create Account"}
        </button>
        <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:"#64748b" }}>
          {mode==="login"?"No account? ":"Have an account? "}
          <span onClick={()=>setMode(m=>m==="login"?"signup":"login")} style={{ color:"#6366f1", cursor:"pointer", fontWeight:600 }}>
            {mode==="login"?"Sign Up":"Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function Landing({ setPage }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1a2d5a 60%,#0c1e3c 100%)", padding:"96px 32px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(ellipse at 25% 50%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 25%, rgba(59,130,246,0.14) 0%, transparent 55%)" }} />
        <div style={{ position:"relative", maxWidth:780, margin:"0 auto" }}>
          <div style={{ fontSize:13, color:"#818cf8", fontWeight:700, letterSpacing:4, textTransform:"uppercase", marginBottom:18 }}>India's Environmental Intelligence Platform</div>
          <h1 style={{ margin:"0 0 22px", fontSize:"clamp(30px,5vw,58px)", fontWeight:900, color:"#fff", lineHeight:1.13 }}>
            PollutionWatch —<br />
            <span style={{ background:"linear-gradient(90deg,#818cf8,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              One-stop solution
            </span>{" "}
            to monitor<br />Climate & Pollution in India
          </h1>
          <p style={{ fontSize:18, color:"#94a3b8", margin:"0 auto 36px", maxWidth:560, lineHeight:1.65 }}>
            Real-time AQI, estimated Water & Soil indices — covering every state and city across India.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>setPage("air")} style={{ padding:"13px 34px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#3b82f6)", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer" }}>
              Monitor Air Quality →
            </button>
            <button onClick={()=>setPage("water")} style={{ padding:"13px 34px", borderRadius:12, border:"2px solid rgba(255,255,255,0.18)", background:"transparent", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
              Explore Water Data
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ background:"#f8fafc", padding:"64px 32px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h2 style={{ margin:"0 0 10px", fontSize:34, fontWeight:900, color:"#1e293b" }}>Three Pillars of Environmental Monitoring</h2>
          <p style={{ color:"#64748b", fontSize:16 }}>Comprehensive data across all 28 states and 8 union territories</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:24, maxWidth:1080, margin:"0 auto" }}>
          {[
            { id:"air", emoji:"💨", title:"Air Quality", sub:"Real-Time (OpenWeatherMap)", desc:"Live AQI, PM2.5, PM10, CO, NO₂, O₃, SO₂ data. 7-day trend charts and pollution heatmaps for every major Indian city.", color:"#6366f1", bg:"linear-gradient(135deg,#eef2ff,#f5f3ff)" },
            { id:"water", emoji:"💧", title:"Water Quality", sub:"Estimated Index", desc:"Water Quality Index derived from rainfall and humidity data. Track bacteria, nitrates, turbidity for rivers, lakes, and reservoirs.", color:"#0891b2", bg:"linear-gradient(135deg,#ecfeff,#f0f9ff)" },
            { id:"soil", emoji:"🌱", title:"Soil Health", sub:"Estimated Index", desc:"Soil Health Index modelled from agricultural and industrial patterns. Monitor pesticide residue, heavy metals, and erosion risk by district.", color:"#16a34a", bg:"linear-gradient(135deg,#f0fdf4,#ecfdf5)" },
          ].map(c=>(
            <div key={c.id} onClick={()=>setPage(c.id)}
              style={{ background:c.bg, borderRadius:20, padding:36, cursor:"pointer", border:`2px solid ${c.color}1a`, transition:"transform 0.25s, box-shadow 0.25s", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-7px)";e.currentTarget.style.boxShadow=`0 12px 36px ${c.color}22`}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{ fontSize:50, marginBottom:14 }}>{c.emoji}</div>
              <div style={{ fontSize:11, color:c.color, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{c.sub}</div>
              <h3 style={{ margin:"0 0 10px", fontSize:22, fontWeight:800, color:"#1e293b" }}>{c.title}</h3>
              <p style={{ margin:"0 0 20px", color:"#475569", fontSize:14, lineHeight:1.65 }}>{c.desc}</p>
              <span style={{ color:c.color, fontWeight:700, fontSize:14 }}>Open Dashboard →</span>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Science Banner */}
      <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", padding:"60px 32px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ color:"#fff", fontSize:30, fontWeight:900, marginBottom:12 }}>🤝 Citizen Science</h2>
          <p style={{ color:"#94a3b8", fontSize:16, marginBottom:32, lineHeight:1.65 }}>
            Report pollution incidents from your area — upload photos, add descriptions, and engage with your community. Together we build a cleaner India.
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
            {[["📸","Upload Reports"],["💬","Community Feed"],["📍","Geo-Tagged"],["📊","Track Trends"]].map(([e,l])=>(
              <div key={l} style={{ color:"#e2e8f0", fontSize:14, fontWeight:600 }}><span style={{ fontSize:28, display:"block", marginBottom:6 }}>{e}</span>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:"#fff", padding:"50px 32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:28, maxWidth:860, margin:"0 auto", textAlign:"center" }}>
          {[["36+","States & UTs"],["600+","Cities Covered"],["Real-Time","AQI Data"],["100%","Free & Open"]].map(([n,l])=>(
            <div key={l}>
              <div style={{ fontSize:38, fontWeight:900, color:"#6366f1" }}>{n}</div>
              <div style={{ color:"#64748b", fontSize:14, marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background:"#0f172a", padding:"44px 32px 20px", color:"#64748b" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:32, maxWidth:1100, margin:"0 auto 28px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:22 }}>🌍</span>
              <span style={{ color:"#fff", fontWeight:900, fontSize:17 }}>PollutionWatch</span>
            </div>
            <p style={{ fontSize:13, lineHeight:1.7, margin:0 }}>India's comprehensive environmental monitoring platform, making pollution data accessible to every citizen.</p>
          </div>
          <div>
            <h4 style={{ color:"#e2e8f0", marginBottom:12, fontSize:14 }}>About Us</h4>
            <p style={{ fontSize:13, lineHeight:1.7, margin:0 }}>A civic technology initiative aggregating environmental data from OpenWeatherMap and scientific models to empower communities and inform policymakers across India.</p>
          </div>
          <div>
            <h4 style={{ color:"#e2e8f0", marginBottom:12, fontSize:14 }}>Contact</h4>
            <p style={{ fontSize:13, margin:"0 0 6px" }}>📧 info@pollutionwatch.in</p>
            <p style={{ fontSize:13, margin:"0 0 6px" }}>📞 1800-XXX-XXXX (Toll Free)</p>
            <p style={{ fontSize:13, margin:0 }}>🐦 @PollutionWatchIN</p>
          </div>
        </div>
        <div style={{ borderTop:"1px solid #1e293b", paddingTop:18, textAlign:"center", fontSize:12 }}>
          © 2024 PollutionWatch India · Air data: OpenWeatherMap API · Water & Soil indices: Estimated · Not a substitute for official measurements
        </div>
      </footer>
    </div>
  );
}

// ─── Air Page ─────────────────────────────────────────────────────────────────
function AirPage() {
  const [data, setData]       = useState(null);
  const [hist, setHist]       = useState([]);
  const [hmap, setHmap]       = useState(null);
  const [top5, setTop5]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel]         = useState({ state:"", city:"" });

  async function search(state, city) {
    setLoading(true); setSel({ state, city });
    const [a,h,hm,t5] = await Promise.all([
      fetch(`${API_BASE}/air/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`).then(r=>r.json()).catch(()=>null),
      fetch(`${API_BASE}/air/history?city=${encodeURIComponent(city)}&days=7`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API_BASE}/air/heatmap?city=${encodeURIComponent(city)}`).then(r=>r.json()).catch(()=>null),
      fetch(`${API_BASE}/air/top5?state=${encodeURIComponent(state)}`).then(r=>r.json()).catch(()=>[]),
    ]);
    setData(a); setHist(h||[]); setHmap(hm); setTop5(t5||[]);
    setLoading(false);
  }

  const lvl = data ? getAqiLevel(data.aqi) : null;

  function downloadReport() {
    if (!data) return;
    const txt = [
      "PollutionWatch — Air Quality Report",
      "=" .repeat(40),
      `City: ${sel.city}, ${sel.state}`,
      `Date: ${new Date().toLocaleDateString("en-IN")}`,
      "",
      `AQI: ${data.aqi} (${lvl.label})`,
      `Temperature: ${data.temp}°C`,
      `Humidity: ${data.humidity}%`,
      `Wind Speed: ${data.wind} m/s`,
      `Conditions: ${data.description}`,
      "",
      "Pollutants:",
      `  PM2.5 : ${data.pm25} μg/m³`,
      `  PM10  : ${data.pm10} μg/m³`,
      `  CO    : ${data.co} μg/m³`,
      `  NO₂   : ${data.no2} μg/m³`,
      `  O₃    : ${data.o3} μg/m³`,
      `  SO₂   : ${data.so2} μg/m³`,
      "",
      "Data source: OpenWeatherMap API",
      "Generated by PollutionWatch India",
    ].join("\n");
    const blob = new Blob([txt], { type:"text/plain" });
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`AQI_${sel.city}_${Date.now()}.txt`; a.click();
  }

  return (
    <div style={{ padding:"32px 28px", maxWidth:1180, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 6px", fontSize:30, fontWeight:900, color:"#1e293b" }}>💨 Air Quality Monitor</h1>
        <p style={{ margin:0, color:"#64748b" }}>Real-time AQI & pollutant data from OpenWeatherMap · All values are live measured data</p>
      </div>

      <Section><StateCitySelect onSearch={search} loading={loading} /></Section>

      {loading && <Spinner />}

      {!loading && data && (
        <>
          {/* AQI Hero Card */}
          <div style={{ background:`linear-gradient(135deg,${lvl.bg},#fff)`, borderRadius:20, padding:"28px 32px", marginBottom:24, border:`2px solid ${lvl.color}33`, display:"flex", gap:28, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ minWidth:140 }}>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Air Quality Index</div>
              <div style={{ fontSize:76, fontWeight:900, color:lvl.color, lineHeight:1 }}>{data.aqi}</div>
              <Badge color={lvl.color} bg={lvl.bg}>{lvl.label}</Badge>
            </div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", flex:1 }}>
              <StatBox emoji="🌡️" label="Temperature" value={data.temp} unit="°C" color="#dc2626" />
              <StatBox emoji="💧" label="Humidity"    value={data.humidity} unit="%" color="#2563eb" />
              <StatBox emoji="💨" label="Wind Speed"  value={data.wind} unit="m/s" color="#6366f1" />
            </div>
            <button onClick={downloadReport} style={{ padding:"9px 18px", borderRadius:10, border:"2px solid #e2e8f0", background:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
              📥 Download Report
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginBottom:22 }}>
            <Section title="🧪 Pollutant Breakdown" style={{ margin:0 }}>
              <PBar label="PM2.5" value={data.pm25}  max={250}   unit="μg/m³" color="#dc2626" />
              <PBar label="PM10"  value={data.pm10}  max={430}   unit="μg/m³" color="#ea580c" />
              <PBar label="CO"    value={data.co}    max={15400} unit="μg/m³" color="#7c3aed" />
              <PBar label="NO₂"   value={data.no2}   max={400}   unit="μg/m³" color="#0891b2" />
              <PBar label="O₃"    value={data.o3}    max={240}   unit="μg/m³" color="#2563eb" />
              <PBar label="SO₂"   value={data.so2}   max={500}   unit="μg/m³" color="#ca8a04" />
            </Section>
            <Section title="📈 7-Day AQI Trend" style={{ margin:0 }}>
              {hist.length > 0
                ? <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={hist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize:11 }} />
                      <YAxis tick={{ fontSize:11 }} domain={['auto','auto']} />
                      <Tooltip contentStyle={{ borderRadius:8, fontSize:13 }} />
                      <Line type="monotone" dataKey="aqi" stroke="#6366f1" strokeWidth={3} dot={{ r:5, fill:"#6366f1" }} />
                    </LineChart>
                  </ResponsiveContainer>
                : <p style={{ color:"#94a3b8", fontSize:14 }}>Historical data unavailable.</p>
              }
            </Section>
          </div>

          {hmap && (
            <Section title={`🗺️ Pollution Heatmap — ${sel.city} & Surrounding Areas`}>
              <LeafMap center={hmap.center} points={hmap.points} />
              <p style={{ fontSize:12, color:"#94a3b8", margin:"8px 0 0" }}>Circle colour = AQI level · Green = Good · Yellow = Moderate · Orange/Red = Unhealthy · Purple = Very Unhealthy</p>
            </Section>
          )}

          {top5.length > 0 && (
            <Section title={`🏭 Top 5 Most Polluted areas — ${sel.state}`}>
              {top5.map((c,i)=>{
                const cl=getAqiLevel(c.aqi);
                return (
                  <div key={c.city} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 0", borderBottom:i<4?"1px solid #f1f5f9":"none" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:cl.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{c.city}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>{c.state}</div>
                    </div>
                    <Badge color={cl.color} bg={cl.bg}>AQI {c.aqi}</Badge>
                  </div>
                );
              })}
            </Section>
          )}

          <Section title="📸 Submit Citizen Report">
            <ReportForm type="air" city={sel.city} state={sel.state} />
          </Section>
          <Section title="💬 Community Feed">
            <Feed type="air" />
          </Section>
        </>
      )}
    </div>
  );
}

// ─── Water Page ───────────────────────────────────────────────────────────────
function WaterPage() {
  const [data, setData]       = useState(null);
  const [top5, setTop5]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel]         = useState({ state:"", city:"" });

  async function search(state, city) {
    setLoading(true); setSel({ state, city });
    const [w,t5] = await Promise.all([
      fetch(`${API_BASE}/water/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`).then(r=>r.json()).catch(()=>null),
      fetch(`${API_BASE}/water/top5?state=${encodeURIComponent(state)}`).then(r=>r.json()).catch(()=>[]),
    ]);
    setData(w); setTop5(t5||[]);
    setLoading(false);
  }

  const wqiColor = data ? (data.wqi<50?"#dc2626":data.wqi<70?"#ea580c":data.wqi<85?"#ca8a04":"#16a34a") : "#0891b2";
  const wqiLabel = data ? (data.wqi<50?"Poor":data.wqi<70?"Fair":data.wqi<85?"Good":"Excellent") : "";

  return (
    <div style={{ padding:"32px 28px", maxWidth:1180, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 8px", fontSize:30, fontWeight:900, color:"#1e293b" }}>💧 Water Quality Monitor</h1>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <p style={{ margin:0, color:"#64748b" }}>Water Quality Index for cities, rivers & lakes across India</p>
          <span style={{ background:"#fef3c7", color:"#92400e", padding:"2px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>⚠️ Estimated Data — not a lab test</span>
        </div>
      </div>

      <Section><StateCitySelect onSearch={search} loading={loading} cityLabel="City / River / Lake" /></Section>
      {loading && <Spinner />}

      {!loading && data && (
        <>
          <div style={{ background:`linear-gradient(135deg,#ecfeff,#fff)`, borderRadius:20, padding:"28px 32px", marginBottom:24, border:`2px solid ${wqiColor}33`, display:"flex", gap:28, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ minWidth:140 }}>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Water Quality Index <span style={{ color:"#f59e0b" }}>(Est.)</span></div>
              <div style={{ fontSize:76, fontWeight:900, color:wqiColor, lineHeight:1 }}>{data.wqi}</div>
              <Badge color={wqiColor} bg="#ecfeff">{wqiLabel}</Badge>
            </div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", flex:1 }}>
              <StatBox emoji="🌧️" label="Rainfall" value={data.rainfall} unit="mm/day" color="#0891b2" />
              <StatBox emoji="💧" label="Humidity"  value={data.humidity} unit="%" color="#2563eb" />
              <StatBox emoji="🌡️" label="Temp"      value={data.temp} unit="°C" color="#dc2626" />
            </div>
            <button onClick={()=>{
              const csv="Date,WQI\n"+(data.trend||[]).map(t=>`${t.date},${t.wqi}`).join("\n");
              const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`WQI_${sel.city}.csv`; a.click();
            }} style={{ padding:"9px 18px", borderRadius:10, border:"2px solid #e2e8f0", background:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              📊 Download CSV
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginBottom:22 }}>
            <Section title="🧪 Pollutant Breakdown (Estimated)" style={{ margin:0 }}>
              <PBar label="Bacteria (E. coli)" value={data.bacteria}     max={100} unit="MPN/100ml" color="#dc2626" />
              <PBar label="Nitrates"            value={data.nitrates}    max={50}  unit="mg/L"      color="#ea580c" />
              <PBar label="Heavy Metals"        value={data.heavy_metals}max={10}  unit="mg/L"      color="#7c3aed" />
              <PBar label="Turbidity"           value={data.turbidity}   max={100} unit="NTU"       color="#0891b2" />
              <PBar label="BOD"                 value={data.bod}         max={30}  unit="mg/L"      color="#ca8a04" />
            </Section>
            <Section title="📈 7-Day WQI Trend (Estimated)" style={{ margin:0 }}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.trend||[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} domain={[0,100]} />
                  <Tooltip contentStyle={{ borderRadius:8, fontSize:13 }} />
                  <Line type="monotone" dataKey="wqi" stroke="#0891b2" strokeWidth={3} dot={{ r:5, fill:"#0891b2" }} />
                </LineChart>
              </ResponsiveContainer>
            </Section>
          </div>

          {top5.length>0 && (
            <Section title={`🌊 Top 5 Most Polluted Water Bodies — ${sel.state} (Estimated)`}>
              {top5.map((c,i)=>(
                <div key={c.name} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 0", borderBottom:i<4?"1px solid #f1f5f9":"none" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#dc2626", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{c.type} · {c.state}</div>
                  </div>
                  <Badge color="#dc2626" bg="#fef2f2">WQI {c.wqi}</Badge>
                </div>
              ))}
            </Section>
          )}

          <Section title="📸 Submit Citizen Report">
            <ReportForm type="water" city={sel.city} state={sel.state} />
          </Section>
          <Section title="💬 Community Feed">
            <Feed type="water" />
          </Section>
        </>
      )}
    </div>
  );
}

// ─── Soil Page ────────────────────────────────────────────────────────────────
function SoilPage() {
  const [data, setData]       = useState(null);
  const [top5, setTop5]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel]         = useState({ state:"", city:"" });

  async function search(state, district) {
    setLoading(true); setSel({ state, city:district });
    const [s,t5] = await Promise.all([
      fetch(`${API_BASE}/soil/search?city=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`).then(r=>r.json()).catch(()=>null),
      fetch(`${API_BASE}/soil/top5?state=${encodeURIComponent(state)}`).then(r=>r.json()).catch(()=>[]),
    ]);
    setData(s); setTop5(t5||[]);
    setLoading(false);
  }

  const shiColor = data ? (data.shi<40?"#dc2626":data.shi<60?"#ea580c":data.shi<80?"#ca8a04":"#16a34a") : "#16a34a";
  const shiLabel = data ? (data.shi<40?"Critically Degraded":data.shi<60?"Degraded":data.shi<80?"Moderate":"Healthy") : "";

  return (
    <div style={{ padding:"32px 28px", maxWidth:1180, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 8px", fontSize:30, fontWeight:900, color:"#1e293b" }}>🌱 Soil Health Monitor</h1>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <p style={{ margin:0, color:"#64748b" }}>Soil Health Index by district across all Indian states</p>
          <span style={{ background:"#fef3c7", color:"#92400e", padding:"2px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>⚠️ Estimated Data — not a field test</span>
        </div>
      </div>

      <Section><StateCitySelect onSearch={search} loading={loading} cityLabel="District" /></Section>
      {loading && <Spinner />}

      {!loading && data && (
        <>
          <div style={{ background:"linear-gradient(135deg,#f0fdf4,#fff)", borderRadius:20, padding:"28px 32px", marginBottom:24, border:`2px solid ${shiColor}33`, display:"flex", gap:28, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ minWidth:140 }}>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Soil Health Index <span style={{ color:"#f59e0b" }}>(Est.)</span></div>
              <div style={{ fontSize:76, fontWeight:900, color:shiColor, lineHeight:1 }}>{data.shi}</div>
              <Badge color={shiColor} bg="#f0fdf4">{shiLabel}</Badge>
            </div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", flex:1 }}>
              <StatBox emoji="🌾" label="Land Type"       value={data.agri_type}       color="#16a34a" />
              <StatBox emoji="🏭" label="Industrial Risk" value={data.industrial_risk} unit="%" color="#ea580c" />
              <StatBox emoji="♻️" label="Organic Matter"  value={data.organic_matter}  unit="%" color="#2563eb" />
            </div>
            <button onClick={()=>{
              const csv="Date,SHI\n"+(data.trend||[]).map(t=>`${t.date},${t.shi}`).join("\n");
              const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`SHI_${sel.city}.csv`; a.click();
            }} style={{ padding:"9px 18px", borderRadius:10, border:"2px solid #e2e8f0", background:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              📊 Download CSV
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginBottom:22 }}>
            <Section title="🧪 Contaminant Breakdown (Estimated)" style={{ margin:0 }}>
              <PBar label="Pesticide Residue" value={data.pesticides}   max={100} unit="index" color="#dc2626" />
              <PBar label="Heavy Metals"      value={data.heavy_metals} max={100} unit="index" color="#7c3aed" />
              <PBar label="Plastic Waste"     value={data.plastic_waste}max={100} unit="index" color="#ea580c" />
              <PBar label="Soil Acidification"value={data.acidification} max={100} unit="index" color="#ca8a04" />
              <PBar label="Erosion Risk"      value={data.erosion_risk}  max={100} unit="index" color="#0891b2" />
            </Section>
            <Section title="📈 6-Month SHI Trend (Estimated)" style={{ margin:0 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.trend||[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} domain={[0,100]} />
                  <Tooltip contentStyle={{ borderRadius:8, fontSize:13 }} />
                  <Bar dataKey="shi" fill="#16a34a" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Section>
          </div>

          {top5.length>0 && (
            <Section title={`🏚️ Top 5 Most Degraded Districts — ${sel.state} (Estimated)`}>
              {top5.map((c,i)=>(
                <div key={c.district} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 0", borderBottom:i<4?"1px solid #f1f5f9":"none" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#ea580c", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{c.district}</div>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{c.reason}</div>
                  </div>
                  <Badge color="#ea580c" bg="#fff7ed">SHI {c.shi}</Badge>
                </div>
              ))}
            </Section>
          )}

          <Section title="📸 Submit Citizen Report">
            <ReportForm type="soil" city={sel.city} state={sel.state} />
          </Section>
          <Section title="💬 Community Feed">
            <Feed type="soil" />
          </Section>
        </>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]         = useState("landing");
  const [user, setUser]         = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        select, input, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onLogin={u=>setUser(u)} />}

      <Navbar page={page} setPage={setPage} user={user} onAuthClick={()=>setShowAuth(true)} onLogout={()=>setUser(null)} />
      <Ticker />

      {page==="landing" && <Landing setPage={setPage} />}
      {page==="air"     && <AirPage />}
      {page==="water"   && <WaterPage />}
      {page==="soil"    && <SoilPage />}
    </div>
  );
}