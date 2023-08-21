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
import {
  css,
  styled,
  t,
  useTheme,
  NO_TIME_RANGE,
  SupersetTheme,
} from '@superset-ui/core';
import Button from 'src/components/Button';
import { useDebouncedEffect } from 'src/explore/exploreUtils';
import { SLOW_DEBOUNCE } from 'src/constants';
import { noOp } from 'src/utils/common';
import { useCSSTextTruncation } from 'src/hooks/useTruncation';

import { DateFilterControlProps, FrameType } from './types';
import {
  DATE_FILTER_TEST_KEY,
  fetchTimeRange,
  // FRAME_OPTIONS,
  guessFrame,
  useDefaultTimeFilter,
} from './utils';
import {
  // CommonFrame,
  // CalendarFrame,
  CustomFrame,
  // AdvancedFrame,
  // DateLabel,
} from './components';

const ButtonWrapper = styled.div`
  display: flex;
  align-items: end;
  padding-bottom: 1px;
  // flex-direction: column;
`;

const getTooltipTitle = (
  isLabelTruncated: boolean,
  label: string | undefined,
  range: string | undefined,
) =>
  isLabelTruncated ? (
    <div>
      {label && <strong>{label}</strong>}
      {range && (
        <div
          css={(theme: SupersetTheme) => css`
            margin-top: ${theme.gridUnit}px;
          `}
        >
          {range}
        </div>
      )}
    </div>
  ) : (
    range || null
  );

export default function DateFilterLabel(props: DateFilterControlProps) {
  const {
    onChange,
    // onOpenPopover = noOp,
    onClosePopover = noOp,
    // overlayStyle = 'Popover',
    // isOverflowingFilterBar = false,
  } = props;
  const defaultTimeFilter = useDefaultTimeFilter();

  const value = props.value ?? defaultTimeFilter;
  // const [actualTimeRange, setActualTimeRange] = useState<string>(value);

  // const [show, setShow] = useState<boolean>(false);
  const guessedFrame = useMemo(() => guessFrame(value), [value]);
  // const [frame, setFrame] = useState<FrameType>(guessedFrame);
  const [lastFetchedTimeRange, setLastFetchedTimeRange] = useState(value);
  const [timeRangeValue, setTimeRangeValue] = useState(value);
  const [validTimeRange, setValidTimeRange] = useState<boolean>(false);
  // const [evalResponse, setEvalResponse] = useState<string>(value);
  // const [tooltipTitle, setTooltipTitle] = useState<ReactNode | null>(value);
  // const theme = useTheme();
  const [labelRef, labelIsTruncated] = useCSSTextTruncation<HTMLSpanElement>();

  useEffect(() => {
    if (value === NO_TIME_RANGE) {
      // setActualTimeRange(NO_TIME_RANGE);
      // setTooltipTitle(null);
      setValidTimeRange(true);
      return;
    }
    fetchTimeRange(value).then(({ value: actualRange, error }) => {
      if (error) {
        // setEvalResponse(error || '');
        setValidTimeRange(false);
        // setTooltipTitle(value || null);
      } else {
        /*
          HRT == human readable text
          ADR == actual datetime range
          +--------------+------+----------+--------+----------+-----------+
          |              | Last | Previous | Custom | Advanced | No Filter |
          +--------------+------+----------+--------+----------+-----------+
          | control pill | HRT  | HRT      | ADR    | ADR      |   HRT     |
          +--------------+------+----------+--------+----------+-----------+
          | tooltip      | ADR  | ADR      | HRT    | HRT      |   ADR     |
          +--------------+------+----------+--------+----------+-----------+
        */
        if (
          guessedFrame === 'Common' ||
          guessedFrame === 'Calendar' ||
          guessedFrame === 'No filter'
        ) {
          // setActualTimeRange(value);
          // setTooltipTitle(
          //   getTooltipTitle(labelIsTruncated, value, actualRange),
          // );
        } else {
          // setActualTimeRange(actualRange || '');
          // setTooltipTitle(
          //   getTooltipTitle(labelIsTruncated, actualRange, value),
          // );
        }
        setValidTimeRange(true);
      }
      setLastFetchedTimeRange(value);
      // setEvalResponse(actualRange || value);
    });
  }, [guessedFrame, labelIsTruncated, labelRef, value]);

  useDebouncedEffect(
    () => {
      if (timeRangeValue === NO_TIME_RANGE) {
        // setEvalResponse(NO_TIME_RANGE);
        setLastFetchedTimeRange(NO_TIME_RANGE);
        setValidTimeRange(true);
        return;
      }
      if (lastFetchedTimeRange !== timeRangeValue) {
        fetchTimeRange(timeRangeValue).then(({ value: actualRange, error }) => {
          if (error) {
            // setEvalResponse(error || '');
            setValidTimeRange(false);
          } else {
            // setEvalResponse(actualRange || '');
            setValidTimeRange(true);
          }
          setLastFetchedTimeRange(timeRangeValue);
        });
      }
    },
    SLOW_DEBOUNCE,
    [timeRangeValue],
  );

  function onSave() {
    onChange(timeRangeValue);
  }

  return (
    <>
      <div
        className="test"
        style={{
          padding: '0 0 0 12px',
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div>
          <CustomFrame value={timeRangeValue} onChange={setTimeRangeValue} />
        </div>
        {/* paddingTop: 18 */}
        <ButtonWrapper>
          <Button
            style={{
              minWidth: 50,
              // position: 'absolute',
              // left: '295px',
              // top: '30px',
            }}
            buttonStyle="primary"
            cta
            disabled={!validTimeRange}
            key="apply"
            onClick={onSave}
            data-test={DATE_FILTER_TEST_KEY.applyButton}
          >
            {t('APPLY')}
          </Button>
        </ButtonWrapper>
      </div>
    </>
  );
}
