/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { t, styled } from '@superset-ui/core';
import moment, { Moment } from 'moment';
// import { isInteger } from 'lodash';
// @ts-ignore
import { locales } from 'antd/dist/antd-with-locales';
import { Row } from 'src/components';
import { DatePicker } from 'src/components/DatePicker';
import {
  // SINCE_GRAIN_OPTIONS,
  // SINCE_MODE_OPTIONS,
  // UNTIL_GRAIN_OPTIONS,
  // UNTIL_MODE_OPTIONS,
  MOMENT_FORMAT,
  // MIDNIGHT,
  customTimeRangeDecode,
  customTimeRangeEncode,
  // dttmToMoment,
  LOCALE_MAPPING,
} from 'src/explore/components/controls/DateFilterControl/utils';
import {
  CustomRangeKey,
  FrameComponentProps,
} from 'src/explore/components/controls/DateFilterControl/types';
import { ExplorePageState } from 'src/explore/types';
import Button from 'src/components/Button';

enum DateType {
  Year = 'year',
  Week = 'week',
  Month = 'month',
  LastMonth = 'lastMonth',
  LastYear = 'LastYear',
}

export function CustomFrame(props: FrameComponentProps) {
  const { customRange, matchedFlag } = customTimeRangeDecode(props.value);
  if (!matchedFlag) {
    customRange.sinceMode = 'specific';
    // props.onChange(customTimeRangeEncode(customRange));
  }

  function onChange(controls: object) {
    props.onChange(
      customTimeRangeEncode({
        ...customRange,
        ...controls,
      }),
    );
  }

  const StyleDateFilterButtons = styled.div`
    display: flex;
    .ant-btn {
      font-size: 10px !important;
      padding: 0 2px;
    }
  `;

  const { RangePicker } = DatePicker;
  const dateFormat = 'YYYY/MM/DD';
  // check if there is a locale defined for explore
  const localFromFlaskBabel = useSelector(
    (state: ExplorePageState) => state?.common?.locale,
  );
  const [untilDate, setUntilDate] = useState(
    props.value !== 'No filter' && props.value.split(' : ').length > 1
      ? moment(props.value.split(' : ')[1])
      : ('' as unknown as moment.Moment),
  );
  const [sinceDate, setSinceDate] = useState(
    props.value !== 'No filter' && props.value.split(' : ').length > 1
      ? moment(props.value.split(' : ')[0])
      : ('' as unknown as moment.Moment),
  );

  const datePickerLocale =
    locales[LOCALE_MAPPING[localFromFlaskBabel]]?.DatePicker;

  const setLastMonth = () => {
    const sinceDatetime = moment().subtract(1, 'months').startOf('month');
    const untilDatetime = moment().subtract(1, 'months').endOf('month');
    setSinceDate(sinceDatetime);
    setUntilDate(untilDatetime);
    return [
      sinceDatetime.format(MOMENT_FORMAT),
      untilDatetime.format(MOMENT_FORMAT),
    ];
  };
  const setLastYear = () => {
    const sinceDatetime = moment().subtract(1, 'years').startOf('year');
    const untilDatetime = moment().subtract(1, 'years').endOf('year');
    setSinceDate(sinceDatetime);
    setUntilDate(untilDatetime);
    return [
      sinceDatetime.format(MOMENT_FORMAT),
      untilDatetime.format(MOMENT_FORMAT),
    ];
  };
  const selectDate = (type: DateType) => {
    let [sinceDatetime, untilDatetime] = '';
    if (type === DateType.LastMonth) {
      [sinceDatetime, untilDatetime] = setLastMonth();
    } else if (type === DateType.LastYear) {
      [sinceDatetime, untilDatetime] = setLastYear();
    } else if (type === DateType.Week) {
      untilDatetime = moment().format(MOMENT_FORMAT);
      setUntilDate(moment());
      sinceDatetime = moment().subtract(1, 'weeks').format(MOMENT_FORMAT);
      setSinceDate(moment().subtract(1, 'weeks'));
    } else if (type === DateType.Month) {
      untilDatetime = moment().format(MOMENT_FORMAT);
      setUntilDate(moment());
      sinceDatetime = moment().startOf('month').format(MOMENT_FORMAT);
      setSinceDate(moment().startOf('month'));
    } else if (type === DateType.Year) {
      untilDatetime = moment().format(MOMENT_FORMAT);
      setUntilDate(moment());
      sinceDatetime = moment().startOf('year').format(MOMENT_FORMAT);
      setSinceDate(moment().startOf('year'));
    }
    console.log(sinceDatetime);
    console.log(untilDatetime);
    onChange({ sinceDatetime, untilDatetime });
  };

  return (
    <>
      <Row>
        <StyleDateFilterButtons>
          <Button
            onClick={() => selectDate(DateType.Week)}
            style={{ paddingLeft: '0px' }}
            buttonStyle="link"
          >
            This Week
          </Button>
          <Button onClick={() => selectDate(DateType.Month)} buttonStyle="link">
            This Month
          </Button>
          <Button onClick={() => selectDate(DateType.Year)} buttonStyle="link">
            This Year
          </Button>
          <Button
            onClick={() => selectDate(DateType.LastMonth)}
            buttonStyle="link"
          >
            Last Month
          </Button>
          <Button
            onClick={() => selectDate(DateType.LastYear)}
            buttonStyle="link"
          >
            Last Year
          </Button>
        </StyleDateFilterButtons>
      </Row>
      <div data-test="custom-frame">
        <Row gutter={24}>
          <RangePicker
            format={dateFormat}
            locale={datePickerLocale}
            value={[sinceDate, untilDate]}
            onChange={arr => {
              if (arr !== null) {
                setSinceDate(arr[0]!);
                setUntilDate(arr[1]!);
                onChange({
                  sinceDatetime: arr[0]?.format(MOMENT_FORMAT),
                  untilDatetime: arr[1]?.format(MOMENT_FORMAT),
                });
              } else {
                setSinceDate('' as unknown as moment.Moment);
                setUntilDate('' as unknown as moment.Moment);
                onChange({
                  sinceDatetime: '',
                  untilDatetime: '',
                });
              }
              // setTimeout(() => {
              //   if (props.onSave) {
              //     props.onSave();
              //   }
              // }, 2000);
            }}
          />
        </Row>
      </div>
    </>
  );
}
