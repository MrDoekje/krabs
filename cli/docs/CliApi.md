# CliApi

All URIs are relative to **

Method | HTTP request | Description
------------- | ------------- | -------------
[**cliControllerExecuteByName**](CliApi.md#cliControllerExecuteByName) | **POST** /task/{name}/execute | 
[**cliControllerRunQueueByName**](CliApi.md#cliControllerRunQueueByName) | **POST** /task/{name}/queue | 



## cliControllerExecuteByName



### Example

```bash
 cliControllerExecuteByName name=value
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **name** | **string** |  | [default to null]
 **executeTaskDto** | [**ExecuteTaskDto**](ExecuteTaskDto.md) |  |

### Return type

(empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not Applicable

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## cliControllerRunQueueByName



### Example

```bash
 cliControllerRunQueueByName name=value
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **name** | **string** |  | [default to null]
 **executeTaskDto** | [**ExecuteTaskDto**](ExecuteTaskDto.md) |  |

### Return type

(empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not Applicable

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

