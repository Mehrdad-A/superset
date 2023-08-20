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
import React from 'react';
import { useSelector } from 'react-redux';
import { t } from '@superset-ui/core';
import { Moment } from 'moment';
// import { isInteger } from 'lodash';
// @ts-ignore
import { locales } from 'antd/dist/antd-with-locales';
import { Row } from 'src/components';
// import { Col, Row } from 'src/components';
// import { InputNumber } from 'src/components/Input';
import { DatePicker } from 'src/components/DatePicker';
// import { Radio } from 'src/components/Radio';
// import Select from 'src/components/Select/Select';
// import { InfoTooltipWithTrigger } from '@superset-ui/chart-controls';
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

export function CustomFrame(props: FrameComponentProps) {
  const { customRange, matchedFlag } = customTimeRangeDecode(props.value);
  if (!matchedFlag) {
    customRange.sinceMode = 'specific';
    // props.onChange(customTimeRangeEncode(customRange));
  }
  // const {
  //   sinceDatetime,
  //   sinceMode,
  //   sinceGrain,
  //   sinceGrainValue,
  //   untilDatetime,
  //   untilMode,
  //   untilGrain,
  //   untilGrainValue,
  //   anchorValue,
  //   anchorMode,
  // } = { ...customRange };

  function onChange(controls: object) {
    props.onChange(
      customTimeRangeEncode({
        ...customRange,
        ...controls,
      }),
    );
  }

  // function onGrainValue(
  //   control: 'sinceGrainValue' | 'untilGrainValue',
  //   value: string | number,
  // ) {
  //   // only positive values in grainValue controls
  //   if (isInteger(value) && value > 0) {
  //     props.onChange(
  //       customTimeRangeEncode({
  //         ...customRange,
  //         [control]: value,
  //       }),
  //     );
  //   }
  // }

  // function onAnchorMode(option: any) {
  //   const radioValue = option.target.value;
  //   if (radioValue === 'now') {
  //     props.onChange(
  //       customTimeRangeEncode({
  //         ...customRange,
  //         anchorValue: 'now',
  //         anchorMode: radioValue,
  //       }),
  //     );
  //   } else {
  //     props.onChange(
  //       customTimeRangeEncode({
  //         ...customRange,
  //         anchorValue: MIDNIGHT,
  //         anchorMode: radioValue,
  //       }),
  //     );
  //   }
  // }

  const { RangePicker } = DatePicker;
  const dateFormat = 'YYYY/MM/DD';
  // check if there is a locale defined for explore
  const localFromFlaskBabel = useSelector(
    (state: ExplorePageState) => state?.common?.locale,
  );
  // An undefined datePickerLocale is acceptable if no match is found in the LOCALE_MAPPING[localFromFlaskBabel] lookup
  // and will fall back to antd's default locale when the antd DataPicker's prop locale === undefined
  // This also protects us from the case where state is populated with a locale that antd locales does not recognize
  const datePickerLocale =
    locales[LOCALE_MAPPING[localFromFlaskBabel]]?.DatePicker;

  return (
    <div data-test="custom-frame">
      {/* <div className="section-title">{t('Configure custom time range')}</div> */}
      <Row gutter={24}>
        <RangePicker
          format={dateFormat}
          locale={datePickerLocale}
          onChange={arr => {
            // onChange('sinceDatetime', sinceDate.format(MOMENT_FORMAT));
            // onChange('untilDatetime', untileDate.format(MOMENT_FORMAT));
            if (arr !== null) {
              onChange({
                sinceDatetime: arr[0]?.format(MOMENT_FORMAT),
                untilDatetime: arr[1]?.format(MOMENT_FORMAT),
              });
            } else {
              onChange({
                sinceDatetime: '',
                untilDatetime: '',
              });
            }
          }}
        />
      </Row>
    </div>
  );
}
