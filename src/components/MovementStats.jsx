import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { Row, Col } from 'reactstrap';
import { useMediaQuery } from 'react-responsive'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let valString = `${parseFloat(payload[0].payload.sum).toFixed(2)}`;
    if(payload[0].payload.percent){
      valString += ` (${parseFloat(payload[0].value).toFixed(1)}%)`;
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
    let earningData = {
      earnings: [],
    };
    let expensesData = {
      expenses: [],
    };
    if(data) {
      earningData.totals = data.incomes;
      expensesData.totals = data.outcomes;
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
            earningData.earnings.push(newitem);
          }else{
            outliers.incomes.sum += newitem.sum;
            outliers.incomes.percent += newitem.sum;
          }
        }else{
          percent = cat.sum/data.outcomes;
          const newitem = {...cat, "percent": percent};
          if(percent>=percent_cutin){
            expensesData.expenses.push(newitem)
          }else{
            outliers.outcomes.sum += newitem.sum;
            outliers.outcomes.percent += newitem.percent;
          }
        }
      }
      earningData.earnings.sort((a,b)=> b.sum - a.sum); // reverse sorted
      if(outliers.incomes.sum > 0){
        earningData.earnings.push(outliers.incomes)
      }
      expensesData.expenses.sort((a,b)=> b.sum - a.sum); // reverse sorted
      if(outliers.outcomes.sum > 0){
        expensesData.expenses.push(outliers.outcomes);
      }
    }
    const colors = {
      "1": "#66c2a5",
      "-1": "#fc8d62",
    }
    const isLargeScreen = useMediaQuery({minWidth: 960 });
    const labelContentRenderer = (props) => {
      const { x, y, width, height, fill, value } = props;
      if(isLargeScreen){
        return (
        <text x={x} y={y-10} fill={fill} textAnchor="center" dominantBaseline="middle">
          {value.split(' ')[0]}
        </text>
        )
      }else{
        return (
          <text x={x+width+10} y={y+height/2} fill={fill} textAnchor="start" dominantBaseline="middle">
          {value.split(' ')[0]}
        </text>
        )
      }
    };
    
    return (
      <Row>
        <Col xs="12" lg="4">
          <ResponsiveContainer height={400} width={"100%"} >
            <BarChart data={earningData.earnings}
              // width={150} height={40}
              // layout= {isLargeScreen ? 'horizontal':'vertical'}
              barCategoryGap={'10%'} >
              <YAxis type='number' label={{value:"%", position:"top"}} domain={[0, 100]}/>
              <XAxis type='category' dataKey="category" tick={false} />
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey={(item)=> 100*item.percent} fill={colors["1"]}>
                <LabelList dataKey="category" position="end" angle={0} content={labelContentRenderer} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col xs="12" lg="8">
          <ResponsiveContainer height={400} width={"100%"}>
            <BarChart data={expensesData.expenses}
              // width={150} height={40}
              // layout= {isLargeScreen ? 'horizontal':'vertical'}
              barCategoryGap={'10%'} >
              <YAxis type='number' label={{value:"%", position:"top"}} domain={[0, 100]}/>
              <XAxis type='category' dataKey="category" tick={false} />
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey={(item)=> 100*item.percent} fill={colors["-1"]}>
                <LabelList dataKey="category" position="end" angle={0} content={labelContentRenderer} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    )
};

export default MovementsStats