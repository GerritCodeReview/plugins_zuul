// Copyright (C) 2020 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package com.googlesource.gerrit.plugins.zuul;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.gerrit.entities.Change;
import com.google.gerrit.extensions.restapi.Response;
import com.google.gerrit.server.change.RevisionResource;
import com.googlesource.gerrit.plugins.zuul.util.DependsOnFetcher;
import com.googlesource.gerrit.plugins.zuul.util.NeededByFetcher;
import java.util.ArrayList;
import java.util.List;
import org.junit.Test;

public class GetCrdTest {
  private RevisionResource rsrc;
  private DependsOnFetcher dependsOnFetcher;
  private NeededByFetcher neededByFetcher;

  @Test
  public void testNoDependencies() throws Exception {
    configureMocks(new ArrayList<>(), new ArrayList<>());

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).isEmpty();
    assertThat(crdInfo.neededBy).isEmpty();
    assertThat(crdInfo.cycle).isFalse();
  }

  @Test
  public void testSingleDependsOn() throws Exception {
    ArrayList<String> dependsOn = new ArrayList<>();
    dependsOn.add("I00000000");

    configureMocks(dependsOn, new ArrayList<>());

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).containsExactly("I00000000");
    assertThat(crdInfo.neededBy).isEmpty();
    assertThat(crdInfo.cycle).isFalse();
  }

  @Test
  public void testMultipleDependsOn() throws Exception {
    ArrayList<String> dependsOn = new ArrayList<>();
    dependsOn.add("I00000000");
    dependsOn.add("I00000002");
    dependsOn.add("I00000004");

    configureMocks(dependsOn, new ArrayList<>());

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).containsExactly("I00000000", "I00000002", "I00000004");
    assertThat(crdInfo.neededBy).isEmpty();
    assertThat(crdInfo.cycle).isFalse();
  }

  @Test
  public void testSingleNeededBy() throws Exception {
    List<String> dependsOn = new ArrayList<>();

    List<String> neededBy = new ArrayList<>();
    neededBy.add("I00000001");

    configureMocks(dependsOn, neededBy);

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).isEmpty();
    assertThat(crdInfo.neededBy).containsExactly("I00000001");
    assertThat(crdInfo.cycle).isFalse();
  }

  @Test
  public void testMultipleNeededBy() throws Exception {
    List<String> dependsOn = new ArrayList<>();

    List<String> neededBy = new ArrayList<>();
    neededBy.add("I00000001");
    neededBy.add("I00000003");
    neededBy.add("I00000005");

    configureMocks(dependsOn, neededBy);

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).isEmpty();
    assertThat(crdInfo.neededBy).containsExactly("I00000001", "I00000003", "I00000005");
    assertThat(crdInfo.cycle).isFalse();
  }

  @Test
  public void testMixed() throws Exception {
    List<String> dependsOn = new ArrayList<>();
    dependsOn.add("I00000002");
    dependsOn.add("I00000004");

    List<String> neededBy = new ArrayList<>();
    neededBy.add("I00000001");
    neededBy.add("I00000003");

    configureMocks(dependsOn, neededBy);

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).containsExactly("I00000002", "I00000004");
    assertThat(crdInfo.neededBy).containsExactly("I00000001", "I00000003");
    assertThat(crdInfo.cycle).isFalse();
  }

  @Test
  public void testSimpleCycle() throws Exception {
    List<String> dependsOn = new ArrayList<>();
    dependsOn.add("I00000001");

    List<String> neededBy = new ArrayList<>();
    neededBy.add("I00000001");

    configureMocks(dependsOn, neededBy);

    GetCrd getCrd = createGetCrd();
    Response<CrdInfo> response = getCrd.apply(rsrc);

    assertThat(response.statusCode()).isEqualTo(200);
    CrdInfo crdInfo = response.value();
    assertThat(crdInfo.dependsOn).containsExactly("I00000001");
    assertThat(crdInfo.neededBy).containsExactly("I00000001");
    assertThat(crdInfo.cycle).isTrue();
  }

  public void configureMocks(final List<String> dependsOn, final List<String> neededBy)
      throws Exception {
    Change.Key changeKey = Change.key("I0123456789");
    Change change = new Change(changeKey, null, null, null, null);
    rsrc = mock(RevisionResource.class);
    when(rsrc.getChange()).thenReturn(change);

    dependsOnFetcher = mock(DependsOnFetcher.class);
    when(dependsOnFetcher.fetchForRevision(rsrc)).thenReturn(dependsOn);

    neededByFetcher = mock(NeededByFetcher.class);
    when(neededByFetcher.fetchForChangeKey(changeKey)).thenReturn(neededBy);
  }

  private GetCrd createGetCrd() {
    return new GetCrd(dependsOnFetcher, neededByFetcher);
  }
}
