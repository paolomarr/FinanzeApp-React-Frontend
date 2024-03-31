import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let valString = `${parseFloat(payload[0].value).toFixed(2)}`;
    if(payload[0].payload.percent){
      valString += ` (${parseFloat(payload[0].payload.percent).toFixed(2)*100}%)`;
    }
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p>{valString}</p>
      </div>
    );
  }

  return null;
};

const MovementsStats = ({data}) => {
    const percent_cutin = 0.05;
    let localData = [];
    if(data) {
      localData.push({category: "TOT_IN", sum: data.incomes, direction: 1});
      localData.push({category: "TOT_OUT", sum: data.outcomes, direction: -1});
      let incomes = [];
      let outcomes = [];
      let outliers = {
        incomes: {category: "Other in.", sum: 0, percent: 0, direction: 1},
        outcomes: {category: "Other out.", sum: 0, percent: 0, direction: -1},
      }
      for (const catName in data.categories) {
        const cat = data.categories[catName];
        let percent = 0.;
        if(cat.direction === 1) {
          percent = cat.sum/data.incomes;
          const newitem = {...cat, "percent": percent};
          if(percent>=percent_cutin){
            incomes.push(newitem)
          }else{
            outliers.incomes.sum += newitem.sum;
            outliers.incomes.percent += newitem.sum;
          }
        }else{
          percent = cat.sum/data.outcomes;
          const newitem = {...cat, "percent": percent};
          if(percent>=percent_cutin){
            outcomes.push(newitem)
          }else{
            outliers.outcomes.sum += newitem.sum;
            outliers.outcomes.percent += newitem.percent;
          }
        }
      }
      incomes.sort((a,b)=> b.sum - a.sum); // reverse sorted
      localData.push(...incomes);
      if(outliers.incomes.sum > 0){
        localData.push(outliers.incomes)
      }
      outcomes.sort((a,b)=> b.sum - a.sum); // reverse sorted
      localData.push(...outcomes);
      if(outliers.outcomes.sum > 0){
        localData.push(outliers.outcomes);
      }
    }
    const colors = {
      "1": "#66c2a5",
      "-1": "#fc8d62",
    }
    const labelContentRenderer = (props) => {
      const { x, y, width, height, fill, value } = props;
      return (
        <text x={x + width + 10} y={y + height/2} fill={fill} textAnchor="start" dominantBaseline="middle">
        {value.split(' ')[0]}
      </text>
      )
    };
    return (
      <ResponsiveContainer width="100%" height={800}>
          <BarChart data={localData} 
            // height={"500px"}
            layout='vertical' 
            barCategoryGap={'20%'} >
            <XAxis type='number'/>
            <YAxis type='category' dataKey="category" tick={false} />
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