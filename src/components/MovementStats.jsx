import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p>{`${parseFloat(payload[0].value).toFixed(2)} (${parseFloat(payload[0].payload.percent).toFixed(2)*100}%)`}</p>
      </div>
    );
  }

  return null;
};

const MovementsStats = ({data}) => {
    let localData = [];
    if(data) {
      let incomes = [];
      let outcomes = [];
      for (const catName in data.categories) {
        const cat = data.categories[catName];
        let percent = 0.;
        if(cat.direction === 1) {
          percent = cat.sum/data.incomes;
          incomes.push({...cat, "percent": percent})
        }else{
          percent = cat.sum/data.outcomes;
          outcomes.push({...cat, "percent": percent})
        }
      }
      incomes.sort((a,b)=> b.sum - a.sum); // reverse sorted
      localData.push(...incomes);
      outcomes.sort((a,b)=> b.sum - a.sum); // reverse sorted
      localData.push(...outcomes);
    }
    const colors = {
      "-1": "blue",
      "1": "red",
    }
    const labelContentRenderer = (props) => {
      const { x, y, width, fill, value } = props;
      return (
        <text x={x + width / 2} y={y-10} fill={fill} textAnchor="middle" dominantBaseline="middle">
        {value.split(' ')[0]}
      </text>
      )
    };
    return (
      <ResponsiveContainer width="100%" height={400}>
          <BarChart data={localData} layout='horizontal'>
            <YAxis />
            <XAxis type='category' dataKey="category" tick={false} />
            <Tooltip content={<CustomTooltip />}/>
            <Bar dataKey={"sum"}>
              {
                localData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.direction]} />
                ))
              }
              <LabelList dataKey="category" position="top" angle={0} content={labelContentRenderer} />
            </Bar>
          </BarChart>
      </ResponsiveContainer>
    )
};

export default MovementsStats