import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell } from 'recharts';
import { Row, Col } from 'reactstrap';
import { useMediaQuery } from 'react-responsive'
import { t } from "@lingui/macro";


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
    let totalsData = [];
    if(data) {
      totalsData = [{direction: 1, category: t`Earnings`, sum: data.incomes}, {direction: -1, category: t`Expenses`, sum: data.outcomes}];
      let outliers = {
        incomes: {category: t`Other in.`, sum: 0, percent: 0, direction: 1},
        outcomes: {category: t`Other out.`, sum: 0, percent: 0, direction: -1},
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
    // const labelContentRenderer = (props) => {
    //   const { x, y, width, height, fill, value } = props;
    //   if(isLargeScreen){
    //     return (
    //     <text x={x} y={y-10} fill={fill} textAnchor="center" dominantBaseline="middle">
    //       {value.split(' ')[0]}
    //     </text>
    //     )
    //   }else{
    //     return (
    //       <text x={x+width+10} y={y+height/2} fill={fill} textAnchor="start" dominantBaseline="middle">
    //       {value.split(' ')[0]}
    //     </text>
    //     )
    //   }
    // };
    const ResponsiveBarChart = ({data, dataKey, title, label}) => {
      const defaultLabel = {value:"%", position:"insideTopLeft", offset: 10};
      if(label) {
        label = {...defaultLabel, ...label};
      }else{
        label = defaultLabel;
      }
      if(isLargeScreen){
        return (
          <>
            <ResponsiveContainer height={400} width={"90%"} >
              <BarChart data={data}
                margin={{top:20, left:0, right:0, bottom:0}}
                barCategoryGap={'10%'} >
                <YAxis type='number' label={label} />
                <XAxis type='category' dataKey="category" tick={false} />
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey={dataKey}>
                  {
                    data.map((item, index) => (
                      <Cell key={`bar_${index}`} fill={item.direction === 1 ? colors["1"]: colors["-1"]} />
                    ))
                  }
                  <LabelList dataKey="category" position="center" textAnchor='center' width={400} fill='#666' angle={-90} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className='bar-chart-title'>{title}</div>
          </>
        )
      }else{
        const barSize = 30;
        const chartHeight = barSize * (data.length + 1);
        return (
          <>
            <div className='bar-chart-title'>{title}</div>
            <ResponsiveContainer height={chartHeight} width={"100%"} >
              <BarChart data={data}
                layout='vertical'
                margin={{top:0, left:0, right:0, bottom:0}}
                barCategoryGap={'10%'} >
                <XAxis type='number' label={label} />
                <YAxis type='category' dataKey="category" tick={false} hide={true} />
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey={dataKey} barSize={barSize} >
                  {
                    data.map((item, index) => (
                      <Cell key={`bar_${index}`} fill={item.direction === 1 ? colors["1"]: colors["-1"]} />
                    ))
                  }
                  <LabelList dataKey="category" position="insideLeft" width={400} angle={0} fill='#666' />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )
      }
    };
    
    const nCategories = earningData.earnings.length + expensesData.expenses.length;
    const earningsChartWidth = Math.ceil(9 * earningData.earnings.length / nCategories);
    const expensedChartWidth = Math.floor(9 * expensesData.expenses.length / nCategories);
    return (
      <Row className='mb-2'>
        <Col xs="12" lg={earningsChartWidth}>
          <ResponsiveBarChart title={t`Earnings`} data={earningData.earnings}  dataKey={(item)=> 100*item.percent}/>
        </Col>
        <Col xs="12" lg={expensedChartWidth}>
          <ResponsiveBarChart title={t`Expenses`} data={expensesData.expenses} dataKey={(item)=> 100*item.percent}/>
        </Col>
        <Col xs="12" lg="3">
          <ResponsiveBarChart title={t`Totals`} label={{value: "€"}} data={totalsData} dataKey={"sum"}/>
        </Col>
      </Row>
    )
};

export default MovementsStats