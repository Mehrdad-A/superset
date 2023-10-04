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
import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import { styled, NO_TIME_RANGE } from '@superset-ui/core';
import Button from 'src/components/Button';
import { useDebouncedEffect } from 'src/explore/exploreUtils';
import { SLOW_DEBOUNCE } from 'src/constants';

import { DateFilterControlProps, FrameType } from './types';
import {
  DATE_FILTER_TEST_KEY,
  fetchTimeRange,
  guessFrame,
  useDefaultTimeFilter,
} from './utils';
import { CustomFrame } from './components';

const ButtonWrapper = styled.div`
  display: none;
  align-items: end;
  padding-bottom: 1px;
  // flex-direction: column;
`;

export default function DateFilterLabel(props: DateFilterControlProps) {
  const { onChange } = props;
  const defaultTimeFilter = useDefaultTimeFilter();

  const value = props.value ?? defaultTimeFilter;

  const [lastFetchedTimeRange, setLastFetchedTimeRange] = useState(value);
  const [timeRangeValue, setTimeRangeValue] = useState('');
  const [validTimeRange, setValidTimeRange] = useState<boolean>(false);

  useEffect(() => {
    if (value === NO_TIME_RANGE) {
      setValidTimeRange(true);
      return;
    }
    fetchTimeRange(value).then(res => {
      if (res.error) {
        setValidTimeRange(false);
      } else {
        setValidTimeRange(true);
        if (res.since && res.until) {
          setLastFetchedTimeRange(`${res.since} : ${res.until}`);
          setTimeRangeValue(`${res.since} : ${res.until}`);
        } else {
          setLastFetchedTimeRange(res.value);
          setTimeRangeValue(res.value || '');
        }
      }
    });
  }, []);

  function onSave() {
    onChange(timeRangeValue);
  }

  useDebouncedEffect(
    () => {
      if (timeRangeValue === '') return;
      if (timeRangeValue === NO_TIME_RANGE) {
        setLastFetchedTimeRange(NO_TIME_RANGE);
        setValidTimeRange(true);
        onSave();
        return;
      }
      if (lastFetchedTimeRange !== timeRangeValue) {
        fetchTimeRange(timeRangeValue).then(res => {
          if (res.error) {
            setValidTimeRange(false);
          } else {
            setValidTimeRange(true);
            setLastFetchedTimeRange(timeRangeValue);
            onSave();
          }
        });
      }
    },
    SLOW_DEBOUNCE,
    [timeRangeValue],
  );

  return (
    <>
      <div
        style={{
          padding: '0 0 0 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div>
          <CustomFrame value={timeRangeValue} onChange={setTimeRangeValue} />
        </div>
      </div>
    </>
  );
}
